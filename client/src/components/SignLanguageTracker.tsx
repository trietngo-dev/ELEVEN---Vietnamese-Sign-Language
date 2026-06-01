import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  HolisticLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

// === CÁC HẰNG SỐ CHUẨN MỚI NHẤT ===
const HAND_LANDMARK_COUNT = 21;
const TARGET_FRAME_COUNT = 50;

const SELECTED_POSE_INDICES = [0, 11, 12, 13, 14, 15, 16, 23, 24];
const SELECTED_FACE_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317,
  14, 87, 178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 46, 53, 52,
  65, 55, 70, 63, 105, 66, 107, 276, 283, 282, 295, 285, 300, 293, 334, 296,
  336,
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";
const PREDICT_ENDPOINT = `${API_BASE_URL}/api/gesture/predict`;
const TRANSLATE_SENTENCE_ENDPOINT = `${API_BASE_URL}/api/gesture/translate-sentence`;
const CONFIDENCE_THRESHOLD = 0.95; // Tăng độ tự tin tối thiểu lên 95% theo yêu cầu
const HAND_SMOOTHING_ALPHA = 0.35;
const MAX_HAND_HOLD_FRAMES = 4;

// === TYPE MỚI: HOÀN TOÀN BỎ VISIBILITY ===
type Keypoint = {
  x: number;
  y: number;
  z: number;
};

type PredictApiResponse = {
  word?: string;
  message?: string;
  confidence?: number;
  predictedId?: number;
  label?: string;
  probabilities?: Record<string, number>;
};

type TranslateSentenceResponse = {
  sentence?: string;
};

const SignLanguageTracker = () => {
  const { pathname } = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCollectingRef = useRef(false);
  const frameBufferRef = useRef<number[][]>([]);
  const prevLeftHandRef = useRef<Keypoint[] | null>(null);
  const prevRightHandRef = useRef<Keypoint[] | null>(null);
  const missingLeftHandFramesRef = useRef(0);
  const missingRightHandFramesRef = useRef(0);
  const translationSessionRef = useRef(0);
  const recognizedWordsRef = useRef<string[]>([]);

  const navigate = useNavigate();

  const [capturedFrames, setCapturedFrames] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isPolishing, setIsPolishing] = useState(false);
  const [recognizedWords, setRecognizedWords] = useState<string[]>([]);
  const [finalSentence, setFinalSentence] = useState("");
  const [uploadStatus, setUploadStatus] = useState(
    "Sẵn sàng dịch câu liên tục",
  );
  const [backendResult, setBackendResult] = useState<PredictApiResponse | null>(
    null,
  );
  // const [showLandmarks, setShowLandmarks] = useState(false);

  const isInitializing = useRef(false);
  const countdownTimerRef = useRef<any>(null);
  const showLandmarksRef = useRef(false);
  const stopCameraRef = useRef<() => void>(() => {});
  const didMountPathEffectRef = useRef(false);
  const consecutiveIdleFramesRef = useRef(0); // Đếm số frame không có bàn tay

  const toFiniteNumber = (value: unknown) => {
    const num = typeof value === "number" ? value : 0;
    return Number.isFinite(num) ? num : 0;
  };

  // Chỉ lấy x, y, z
  const toKeypoint = (point?: {
    x?: number;
    y?: number;
    z?: number;
  }): Keypoint => ({
    x: toFiniteNumber(point?.x),
    y: toFiniteNumber(point?.y),
    z: toFiniteNumber(point?.z),
  });

  const smoothKeypoints = (
    current: Keypoint[],
    previous: Keypoint[] | null,
    alpha: number,
  ): Keypoint[] => {
    if (!previous || previous.length !== current.length) return current;
    return current.map((point, index) => {
      const prev = previous[index];
      return {
        x: prev.x * (1 - alpha) + point.x * alpha,
        y: prev.y * (1 - alpha) + point.y * alpha,
        z: prev.z * (1 - alpha) + point.z * alpha,
      };
    });
  };

  const getHandKeypoints = (
    rawPoints: Array<{ x?: number; y?: number; z?: number }>,
    previousRef: MutableRefObject<Keypoint[] | null>,
    missingFrameCountRef: MutableRefObject<number>,
  ): Keypoint[] => {
    if (rawPoints.length === HAND_LANDMARK_COUNT) {
      missingFrameCountRef.current = 0;
      const current = rawPoints.map((point) => toKeypoint(point));
      const smoothed = smoothKeypoints(
        current,
        previousRef.current,
        HAND_SMOOTHING_ALPHA,
      );
      previousRef.current = smoothed;
      return smoothed;
    }

    missingFrameCountRef.current += 1;
    if (
      previousRef.current &&
      missingFrameCountRef.current <= MAX_HAND_HOLD_FRAMES
    ) {
      return previousRef.current.map((point) => ({ ...point }));
    }

    previousRef.current = null;
    return Array.from({ length: HAND_LANDMARK_COUNT }, () =>
      toKeypoint(undefined),
    );
  };

  const extractFrameKeypoints = (
    results: ReturnType<HolisticLandmarker["detectForVideo"]>,
  ): number[] => {
    const flatKeypoints: number[] = [];

    const pushKeypoint = (point?: { x: number; y: number; z: number }) => {
      if (point) {
        flatKeypoints.push(point.x, point.y, point.z);
      } else {
        flatKeypoints.push(0, 0, 0);
      }
    };

    // 1. POSE (9 điểm -> 27 số)
    const rawPose = results.poseLandmarks?.[0] ?? [];
    for (const index of SELECTED_POSE_INDICES) {
      pushKeypoint(rawPose.length > 0 ? rawPose[index] : undefined);
    }

    // 2. FACE (51 điểm -> 153 số)
    const rawFace = results.faceLandmarks?.[0] ?? [];
    for (const index of SELECTED_FACE_INDICES) {
      pushKeypoint(rawFace.length > 0 ? rawFace[index] : undefined);
    }

    // 3. LEFT HAND (21 điểm -> 63 số)
    const rawLeft = results.leftHandLandmarks?.[0] ?? [];
    const leftHandPoints = getHandKeypoints(
      rawLeft,
      prevLeftHandRef,
      missingLeftHandFramesRef,
    );
    leftHandPoints.forEach((point) => pushKeypoint(point));

    // 4. RIGHT HAND (21 điểm -> 63 số)
    const rawRight = results.rightHandLandmarks?.[0] ?? [];
    const rightHandPoints = getHandKeypoints(
      rawRight,
      prevRightHandRef,
      missingRightHandFramesRef,
    );
    rightHandPoints.forEach((point) => pushKeypoint(point));

    if (flatKeypoints.length !== 306) {
      console.warn(
        `[CẢNH BÁO] Số điểm trích xuất sai: ${flatKeypoints.length} (Kỳ vọng: 306)`,
      );
    }

    return flatKeypoints;
  };

  const normalizeSpatial = (frame: number[]): number[] => {
    // Tọa độ Mũi luôn nằm ở 3 số đầu tiên (index 0, 1, 2)
    const noseX = frame[0];
    const noseY = frame[1];
    const noseZ = frame[2];

    if (noseX === 0 && noseY === 0 && noseZ === 0) {
      return frame;
    }

    const normFrame = [...frame];
    for (let i = 0; i < normFrame.length; i += 3) {
      if (normFrame[i] !== 0 || normFrame[i + 1] !== 0 || normFrame[i + 2] !== 0) {
        normFrame[i] -= noseX;
        normFrame[i + 1] -= noseY;
        normFrame[i + 2] -= noseZ;
      }
    }
    return normFrame;
  };

  const processSlidingWindow = async (
    frames: number[][],
    sessionId: number,
  ) => {
    if (frames.length !== TARGET_FRAME_COUNT) {
      return;
    }

    try {
      const features = frames.flat();
      if (features.length === 0) {
        return;
      }

      const response = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as PredictApiResponse;
      setBackendResult(data);

      if (sessionId !== translationSessionRef.current) {
        return;
      }

      const predictedWord = data.word ?? data.label ?? "";
      const predictedConfidence = data.confidence ?? 0;

      if (!predictedWord || predictedConfidence < CONFIDENCE_THRESHOLD) {
        return;
      }

      setRecognizedWords((prev) => {
        if (prev.at(-1) === predictedWord) {
          return prev;
        }

        const next = [...prev, predictedWord];
        recognizedWordsRef.current = next;
        setUploadStatus(
          `Đã nhận: ${predictedWord} (${(predictedConfidence * 100).toFixed(1)}%)`,
        );
        return next;
      });
    } catch (error) {
      console.error("Predict sliding window thất bại:", error);
      setUploadStatus("Có lỗi khi dự đoán một cụm frame");
    }
  };

  const stopTranslationAndPolish = async (sessionId: number) => {
    const words = [...recognizedWordsRef.current].filter(
      (w) => !w.toLowerCase().includes("ngoiim"),
    );

    if (words.length === 0) {
      setFinalSentence("");
      setUploadStatus("Không có từ nào để trau chuốt");
      return;
    }

    setIsPolishing(true);
    setUploadStatus("Đang trau chuốt câu bằng Gemini...");

    try {
      const response = await fetch(TRANSLATE_SENTENCE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as TranslateSentenceResponse;
      if (sessionId !== translationSessionRef.current) {
        return;
      }
      setFinalSentence((data.sentence ?? "").trim());
      setUploadStatus("Đã hoàn tất trau chuốt câu");
    } catch (error) {
      console.error("Trau chuốt câu thất bại:", error);
      setUploadStatus("Trau chuốt thất bại. Kiểm tra Gemini API.");
    } finally {
      setIsPolishing(false);
    }
  };

  const toggleTranslation = () => {
    if (isCollectingRef.current || isCountingDown) {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      isCollectingRef.current = false;
      setIsCountingDown(false);
      setIsTranslating(false);
      translationSessionRef.current += 1;
      const stoppedSessionId = translationSessionRef.current;
      frameBufferRef.current = [];
      setCapturedFrames(0);
      void stopTranslationAndPolish(stoppedSessionId);
      return;
    }

    // Start Countdown
    setIsTranslating(true);
    setIsCountingDown(true);
    setCountdown(3);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setIsCountingDown(false);
          isCollectingRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    translationSessionRef.current += 1;
    frameBufferRef.current = [];
    prevLeftHandRef.current = null;
    prevRightHandRef.current = null;
    missingLeftHandFramesRef.current = 0;
    missingRightHandFramesRef.current = 0;
    setCapturedFrames(0);
    setRecognizedWords([]);
    recognizedWordsRef.current = [];
    setFinalSentence("");
    setBackendResult(null);
    setUploadStatus("Đang chờ bắt đầu...");
  };

  // const toggleLandmarks = () => {
  //   setShowLandmarks((prev) => {
  //     const next = !prev;
  //     showLandmarksRef.current = next;
  //     return next;
  //   });
  // };

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;
    let isActive = true;

    let holisticLandmarker: HolisticLandmarker;
    let animationId: number | null = null;
    let cameraStream: MediaStream | null = null;

    const stopCameraAndLoop = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const handlePageLeave = () => {
      stopCameraAndLoop();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopCameraAndLoop();
      }
    };

    stopCameraRef.current = stopCameraAndLoop;

    const setupHolistic = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        if (!isActive) {
          return;
        }

        holisticLandmarker = await HolisticLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task`,
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            minPoseDetectionConfidence: 0.6,
            minPosePresenceConfidence: 0.6,
          },
        );

        if (!isActive) {
          holisticLandmarker.close();
          return;
        }

        console.log("AI Model đã tải thành công!");
        await startCamera();
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 60 },
            facingMode: "user",
          },
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        cameraStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.onloadedmetadata = () => {
            if (!isActive) {
              stopCameraAndLoop();
              return;
            }
            videoRef.current?.play();
            predictWebcam();
          };
        }
      } catch (err) {
        console.error("Không tìm thấy camera:", err);
      }
    };

    const predictWebcam = () => {
      if (!isActive) return;
      if (!videoRef.current || !canvasRef.current || !holisticLandmarker)
        return;

      const canvasCtx = canvasRef.current.getContext("2d");
      if (!canvasCtx) return;
      const drawingUtils = new DrawingUtils(canvasCtx);

      const vw = videoRef.current.videoWidth;
      const vh = videoRef.current.videoHeight;
      const size = Math.min(vw, vh);
      const offsetX = (vw - size) / 2;
      const offsetY = (vh - size) / 2;

      // Cập nhật kích thước canvas thành hình vuông
      canvasRef.current.width = size;
      canvasRef.current.height = size;

      // Lật (Mirror) canvas ctx TRƯỚC khi vẽ video để mô phỏng giống `cv2.flip(frame, 1)` của Python.
      // Điều này giúp ảnh đưa vào MediaPipe hoàn toàn giống lúc train.
      canvasCtx.save();
      canvasCtx.translate(size, 0);
      canvasCtx.scale(-1, 1);

      // Vẽ phân đoạn video vuông (Crop)
      canvasCtx.drawImage(
        videoRef.current,
        offsetX,
        offsetY,
        size,
        size, // vị trí video gốc
        0,
        0,
        size,
        size, // đích trên canvas
      );

      canvasCtx.restore();

      // Đưa canvas vuông đã lật này vào MediaPipe
      const startTimeMs = performance.now();
      const results = holisticLandmarker.detectForVideo(
        canvasRef.current,
        startTimeMs,
      );

      // Vẽ landmarks (nếu cần hiển thị debug)
      if (showLandmarksRef.current) {
        if (results.faceLandmarks?.[0]) {
          drawingUtils.drawConnectors(
            results.faceLandmarks[0],
            HolisticLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0C070", lineWidth: 1 },
          );
        }
        if (results.poseLandmarks?.[0]) {
          drawingUtils.drawConnectors(
            results.poseLandmarks[0],
            HolisticLandmarker.POSE_CONNECTIONS,
            { color: "#00FF00", lineWidth: 2 },
          );
        }
        if (results.rightHandLandmarks?.[0]) {
          drawingUtils.drawConnectors(
            results.rightHandLandmarks[0],
            HolisticLandmarker.HAND_CONNECTIONS,
            { color: "#FF0000", lineWidth: 2 },
          );
        }
        if (results.leftHandLandmarks?.[0]) {
          drawingUtils.drawConnectors(
            results.leftHandLandmarks[0],
            HolisticLandmarker.HAND_CONNECTIONS,
            { color: "#00BFFF", lineWidth: 2 },
          );
        }
      }

      canvasCtx.restore();

      if (isCollectingRef.current) {
        const hasLeftHand =
          results.leftHandLandmarks && results.leftHandLandmarks.length > 0;
        const hasRightHand =
          results.rightHandLandmarks && results.rightHandLandmarks.length > 0;

        if (!hasLeftHand && !hasRightHand) {
          consecutiveIdleFramesRef.current += 1;
        } else {
          consecutiveIdleFramesRef.current = 0;
        }

        // Nếu nghỉ quá 20 frame (khoảng ~0.6 giây), ta hủy bỏ buffer hiện tại không thu nữa
        if (
          consecutiveIdleFramesRef.current > 20 &&
          frameBufferRef.current.length > 0
        ) {
          frameBufferRef.current = [];
          setCapturedFrames(0);
        }

        // Nếu không có tay (và buffer đang trống) -> Không bắt đầu gom frame
        if (
          !(
            !hasLeftHand &&
            !hasRightHand &&
            frameBufferRef.current.length === 0
          )
        ) {
          const frameKeypoints = extractFrameKeypoints(results);
          const normalizedKeypoints = normalizeSpatial(frameKeypoints);
          frameBufferRef.current.push(normalizedKeypoints);

          const currentFrames = frameBufferRef.current.length;
          setCapturedFrames(currentFrames);

          if (currentFrames >= TARGET_FRAME_COUNT) {
            const payload = frameBufferRef.current.slice(0, TARGET_FRAME_COUNT);
            // Sliding Window: Giữ lại 15 frame cũ (overlap) cho lần gom tiếp theo, thay vì xóa trắng
            frameBufferRef.current = frameBufferRef.current.slice(
              TARGET_FRAME_COUNT - 15,
            );
            setCapturedFrames(frameBufferRef.current.length);

            void processSlidingWindow(payload, translationSessionRef.current);
          }
        }
      }

      animationId = window.requestAnimationFrame(predictWebcam);
    };

    window.addEventListener("beforeunload", handlePageLeave);
    window.addEventListener("pagehide", handlePageLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    setupHolistic();

    return () => {
      console.log("Cleanup...");
      isActive = false;
      isInitializing.current = false;
      window.removeEventListener("beforeunload", handlePageLeave);
      window.removeEventListener("pagehide", handlePageLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopCameraAndLoop();
      stopCameraRef.current = () => {};
      holisticLandmarker?.close();
    };
  }, []);

  useEffect(() => {
    if (!didMountPathEffectRef.current) {
      didMountPathEffectRef.current = true;
      return;
    }

    stopCameraRef.current();
    isCollectingRef.current = false;
    setIsTranslating(false);
  }, [pathname]);

  const latestPredictedWord = backendResult?.word ?? backendResult?.label ?? "";
  const latestPredictedConfidence = backendResult?.confidence ?? 0;

  const visibleWords = recognizedWords.filter(
    (w) => !w.toLowerCase().includes("ngoiim"),
  );

  const displaySentence =
    finalSentence || "Câu hoàn chỉnh sẽ hiển thị tại đây!";

  return (
    <div className="mx-auto grid w-full max-w-[1300px] gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-0.5 py-2.5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <span className="text-sm font-semibold text-[#5b6068]">
              Quay lại
            </span>
          </Button>
          <span className="text-[#d2d6dc]">|</span>
          <h2 className="m-0 text-2xl font-bold leading-[1.15] text-[#202734]">
            Dịch thuật trực tiếp
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#575548] px-3.5 py-2 text-[13px] font-semibold text-[#f4f4ef]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#f8cb4d]" />
          AI đang quan sát
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative min-h-[500px] max-h-[75vh] flex items-center justify-center overflow-hidden rounded-[18px] border-2 border-[#2f9ef4] bg-[#111111]">
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />

          <canvas
            ref={canvasRef}
            className="block h-full w-full object-contain object-center drop-shadow-lg"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[clamp(280px,50vw,480px)] w-[clamp(280px,50vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-dashed border-white/50 bg-white/5 drop-shadow-md" />

          {isCountingDown && (
            <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <div className="flex animate-pulse flex-col items-center">
                <span className="text-[120px] font-black text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {countdown > 0 ? countdown : "GO!"}
                </span>
                <span className="text-2xl font-bold tracking-widest text-white drop-shadow-md uppercase">
                  Chuẩn bị...
                </span>
              </div>
            </div>
          )}

          <div className="absolute right-3.5 top-1/2 z-[4] flex -translate-y-1/2 flex-col gap-3">
            <button
              type="button"
              onClick={toggleTranslation}
              className={`h-[52px] w-[150px] rounded-xl border border-[#d4d8d5] px-2 text-[11px] font-bold leading-tight text-[#3f7f57] shadow-[0_8px_22px_rgba(0,0,0,0.18)] ${
                isCollectingRef.current
                  ? "cursor-pointer bg-[#fef3c7]"
                  : "cursor-pointer bg-white"
              }`}
              title={
                isCollectingRef.current
                  ? "Kết thúc & Trau chuốt"
                  : "Bắt đầu dịch câu"
              }
            >
              {isCollectingRef.current
                ? "Kết thúc & Trau chuốt"
                : "Bắt đầu dịch câu"}
            </button>
          </div>
        </div>

        <div className="h-fit rounded-[14px] border border-[#dfe4e8] bg-[#f3f5f6] px-[18px] pb-5 pt-4 text-[#243041] lg:min-h-[540px]">
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.8px] text-[#74906f]">
              Bản dịch (ngôn ngữ ký hiệu sang văn bản)
            </p>
            <span className="text-sm font-semibold text-[#648d67]">
              Phát âm
            </span>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-2 min-h-[28px]">
            {visibleWords.length > 0 ? (
              visibleWords.map((w, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-[#e0ece2] px-3 py-1 text-sm font-bold text-[#648d67]"
                >
                  {w}
                </span>
              ))
            ) : (
              <span className="text-sm font-semibold text-[#9ab0a2] italic">
                {isTranslating
                  ? "Đang lắng nghe ký hiệu..."
                  : "Chưa có từ nhận diện"}
              </span>
            )}
          </div>

          <p className="mt-3.5 rounded-xl bg-white/80 p-3 text-[clamp(24px,2vw,34px)] font-bold leading-[1.2] text-[#1f2e43]">
            {displaySentence}
          </p>

          <div className="mt-3.5 inline-flex items-center rounded-full bg-[#e0ece2] px-2.5 py-1 text-xs font-bold text-[#648d67]">
            {isPolishing ? "POLISHING" : isTranslating ? "LIVE" : "IDLE"}
          </div>
          <p className="mt-3 text-sm text-[#4b5667]">
            Frame đã thu: {capturedFrames}/{TARGET_FRAME_COUNT} | Trạng thái:{" "}
            {uploadStatus}
          </p>
          {latestPredictedWord ? (
            <p className="mt-2 text-xs text-[#4b5667]">
              Kết quả gần nhất: {latestPredictedWord} (
              {(latestPredictedConfidence * 100).toFixed(2)}%)
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SignLanguageTracker;
