import React, {
  useState,
  useEffect,
  useRef,
  type MutableRefObject,
} from "react";
import { Camera, CheckCircle, RefreshCcw, Info, Loader2 } from "lucide-react";
import {
  HolisticLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

interface AIPracticePopupProps {
  word: string;
}

type Step =
  | "READY"
  | "INITIALIZING"
  | "COUNTDOWN"
  | "RECORDING"
  | "ANALYZING"
  | "RESULT";

// === CONSTANTS ===
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
const HAND_SMOOTHING_ALPHA = 0.35;
const MAX_HAND_HOLD_FRAMES = 4;

// === TYPES ===
type Keypoint = { x: number; y: number; z: number };
type PredictApiResponse = {
  word?: string;
  message?: string;
  confidence?: number;
  label?: string;
};

const AIPracticePopup: React.FC<AIPracticePopupProps> = ({ word }) => {
  const [step, setStep] = useState<Step>("READY");
  const [countdown, setCountdown] = useState(3);
  const [apiResult, setApiResult] = useState<PredictApiResponse | null>(null);
  const [progress, setProgress] = useState(0); // Progress for capturing 50 frames

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const holisticRef = useRef<HolisticLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const frameBufferRef = useRef<number[][]>([]);
  const isRecordingRef = useRef(false);

  // Smoothing states
  const prevLeftHandRef = useRef<Keypoint[] | null>(null);
  const prevRightHandRef = useRef<Keypoint[] | null>(null);
  const missingLeftHandFramesRef = useRef(0);
  const missingRightHandFramesRef = useRef(0);

  const cleanupCamera = () => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    return () => cleanupCamera();
  }, []);

  const toFiniteNumber = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;
  const toKeypoint = (p?: {
    x?: number;
    y?: number;
    z?: number;
  }): Keypoint => ({
    x: toFiniteNumber(p?.x),
    y: toFiniteNumber(p?.y),
    z: toFiniteNumber(p?.z),
  });

  const smoothKeypoints = (
    current: Keypoint[],
    previous: Keypoint[] | null,
    alpha: number,
  ): Keypoint[] => {
    if (!previous || previous.length !== current.length) return current;
    return current.map((point, i) => ({
      x: previous[i].x * (1 - alpha) + point.x * alpha,
      y: previous[i].y * (1 - alpha) + point.y * alpha,
      z: previous[i].z * (1 - alpha) + point.z * alpha,
    }));
  };

  const getHandKeypoints = (
    rawPoints: Array<{ x?: number; y?: number; z?: number }>,
    previousRef: MutableRefObject<Keypoint[] | null>,
    missingFrameCountRef: MutableRefObject<number>,
  ): Keypoint[] => {
    if (rawPoints.length === HAND_LANDMARK_COUNT) {
      missingFrameCountRef.current = 0;
      const current = rawPoints.map(toKeypoint);
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
      return previousRef.current.map((p) => ({ ...p }));
    }
    previousRef.current = null;
    return Array.from({ length: HAND_LANDMARK_COUNT }, () =>
      toKeypoint(undefined),
    );
  };

  const extractFrameKeypoints = (results: any): number[] => {
    const flatKeypoints: number[] = [];

    const pushKeypoint = (point?: { x: number; y: number; z: number }) => {
      if (point) {
        flatKeypoints.push(point.x, point.y, point.z);
      } else {
        flatKeypoints.push(0, 0, 0);
      }
    };

    const rawPose = results.poseLandmarks?.[0] ?? [];
    for (const index of SELECTED_POSE_INDICES) {
      pushKeypoint(rawPose.length > 0 ? rawPose[index] : undefined);
    }

    const rawFace = results.faceLandmarks?.[0] ?? [];
    for (const index of SELECTED_FACE_INDICES) {
      pushKeypoint(rawFace.length > 0 ? rawFace[index] : undefined);
    }

    const rawLeft = results.leftHandLandmarks?.[0] ?? [];
    const leftHandPoints = getHandKeypoints(
      rawLeft,
      prevLeftHandRef,
      missingLeftHandFramesRef,
    );
    leftHandPoints.forEach((point) => pushKeypoint(point));

    const rawRight = results.rightHandLandmarks?.[0] ?? [];
    const rightHandPoints = getHandKeypoints(
      rawRight,
      prevRightHandRef,
      missingRightHandFramesRef,
    );
    rightHandPoints.forEach((point) => pushKeypoint(point));

    return flatKeypoints;
  };

  const startPractice = async () => {
    setStep("INITIALIZING");
    setApiResult(null);
    frameBufferRef.current = [];
    setProgress(0);

    try {
      if (!holisticRef.current) {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );
        holisticRef.current = await HolisticLandmarker.createFromOptions(
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
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStep("COUNTDOWN");
          setCountdown(3);

          let count = 3;
          const timer = setInterval(() => {
            count--;
            if (count > 0) {
              setCountdown(count);
            } else {
              clearInterval(timer);
              setStep("RECORDING");
              isRecordingRef.current = true;
              predictWebcam(); // Bắt đầu loop ghi hình
            }
          }, 1000);
        };
      }
    } catch (err) {
      console.error(err);
      setStep("READY");
      alert("Lỗi khởi chạy Camera hoặc AI Model.");
    }
  };

  const predictWebcam = () => {
    if (!videoRef.current || !canvasRef.current || !holisticRef.current) return;
    if (!isRecordingRef.current) return; // Chỉ loop khi đang recording

    const canvasCtx = canvasRef.current.getContext("2d");
    if (!canvasCtx) return;

    const vw = videoRef.current.videoWidth;
    const vh = videoRef.current.videoHeight;
    const size = Math.min(vw, vh);
    const offsetX = (vw - size) / 2;
    const offsetY = (vh - size) / 2;

    canvasRef.current.width = size;
    canvasRef.current.height = size;

    canvasCtx.save();
    canvasCtx.translate(size, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(
      videoRef.current,
      offsetX,
      offsetY,
      size,
      size,
      0,
      0,
      size,
      size,
    );

    const results = holisticRef.current.detectForVideo(
      canvasRef.current,
      performance.now(),
    );

    // Vẽ khung xương mờ nếu muốn feedback cho người dùng
    const drawingUtils = new DrawingUtils(canvasCtx);
    if (results.poseLandmarks?.[0]) {
      drawingUtils.drawConnectors(
        results.poseLandmarks[0],
        HolisticLandmarker.POSE_CONNECTIONS,
        { color: "#00FF0080", lineWidth: 2 },
      );
    }
    if (results.leftHandLandmarks?.[0]) {
      drawingUtils.drawConnectors(
        results.leftHandLandmarks[0],
        HolisticLandmarker.HAND_CONNECTIONS,
        { color: "#00BFFF", lineWidth: 2 },
      );
    }
    if (results.rightHandLandmarks?.[0]) {
      drawingUtils.drawConnectors(
        results.rightHandLandmarks[0],
        HolisticLandmarker.HAND_CONNECTIONS,
        { color: "#FF0000", lineWidth: 2 },
      );
    }
    canvasCtx.restore();

    // Lưu frame data
    const frameKeypoints = extractFrameKeypoints(results);
    frameBufferRef.current.push(frameKeypoints);
    setProgress(frameBufferRef.current.length);

    if (frameBufferRef.current.length >= TARGET_FRAME_COUNT) {
      // Đã đủ 50 frame
      isRecordingRef.current = false;
      finishRecording(frameBufferRef.current);
    } else {
      animationIdRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  const finishRecording = async (frames: number[][]) => {
    setStep("ANALYZING");
    cleanupCamera(); // Dừng camera ngay lập tức

    try {
      const features = frames.flat();

      const predictRes = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
      });
      if (!predictRes.ok) throw new Error("Lỗi gọi API AI");
      const data = (await predictRes.json()) as PredictApiResponse;

      setApiResult(data);
    } catch (err) {
      console.error(err);
      setApiResult({ label: "Lỗi kết nối AI Server", confidence: 0 });
    } finally {
      setStep("RESULT");
    }
  };

  const normalizeWord = (str?: string) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

  const targetWord = normalizeWord(word);
  const predictedWord =
    normalizeWord(apiResult?.label) || normalizeWord(apiResult?.word);

  const isMatch =
    !!apiResult &&
    predictedWord === targetWord &&
    !!apiResult.confidence &&
    apiResult.confidence > 0.65;

  const confidenceScore = apiResult?.confidence
    ? Math.round(apiResult.confidence * 100)
    : 0;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-b-2xl overflow-hidden shadow-lg">
      {/* Header trạng thái */}
      <div className="px-4 py-2.5 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 text-sm truncate max-w-[120px]">
          {word}
        </h3>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
          {step === "READY" && "Sẵn sàng"}
          {step === "INITIALIZING" && "Đang tải AI..."}
          {step === "COUNTDOWN" && "Chuẩn bị"}
          {step === "RECORDING" && "Đang bắt tọa độ"}
          {step === "ANALYZING" && "Phân tích"}
          {step === "RESULT" && "2. Đánh giá"}
        </span>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-black">
        {/* Render ẩn video và canvas để ref luôn tồn tại */}
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas
          ref={canvasRef}
          className={
            step === "COUNTDOWN" || step === "RECORDING"
              ? "w-full h-full object-cover"
              : "hidden"
          }
        />

        {step === "READY" && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-6 text-center">
            <Camera size={48} className="mb-4 text-slate-400" />
            <h4 className="font-bold mb-2">Sẵn sàng thực hành?</h4>
            <p className="text-xs text-slate-400 mb-6">
              Bạn sẽ có 3 giây chuẩn bị, và ~2 giây để thực hiện ký hiệu trước
              ống kính.
            </p>
            <button
              onClick={startPractice}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
            >
              <Camera size={18} /> Bắt đầu ngay
            </button>
          </div>
        )}

        {step === "INITIALIZING" && (
          <div className="w-full h-full flex flex-col items-center justify-center text-white text-center px-4 bg-slate-900">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
            <h4 className="font-bold text-base">
              Đang tải mô hình MediaPipe...
            </h4>
            <p className="text-xs text-slate-400 mt-2">Vui lòng chờ giây lát</p>
          </div>
        )}

        {(step === "COUNTDOWN" || step === "RECORDING") && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-transparent pointer-events-none">
            {step === "COUNTDOWN" && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center pointer-events-auto">
                <span className="text-7xl font-black text-white drop-shadow-2xl animate-ping">
                  {countdown}
                </span>
                <span className="text-white font-bold tracking-widest mt-4">
                  CHUẨN BỊ
                </span>
              </div>
            )}

            {step === "RECORDING" && (
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="bg-red-500/90 text-white px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-2 animate-pulse shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full"></div> ĐANG GHI
                  HÌNH CỬ CHỈ ({progress}/{TARGET_FRAME_COUNT})
                </div>
              </div>
            )}
          </div>
        )}

        {step === "ANALYZING" && (
          <div className="w-full h-full flex flex-col items-center justify-center text-white text-center px-4">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
            <h4 className="font-bold text-base">AI đang phân tích...</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Đang gửi 50 frames tọa độ thật của bạn lên Server Python.
            </p>
          </div>
        )}

        {step === "RESULT" && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center bg-white p-5">
            {isMatch ? (
              <>
                <CheckCircle size={56} className="text-green-500 mb-3" />
                <h4 className="text-xl font-black text-slate-800">
                  Chính xác! Đạt {confidenceScore}%
                </h4>
                <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                  Dáng tay và chuyển động của bạn rất khớp với mẫu!
                </p>
              </>
            ) : (
              <>
                <Info size={56} className="text-amber-500 mb-3" />
                <h4 className="text-xl font-black text-slate-800">
                  Chưa chính xác - Cần cố gắng
                </h4>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-3 w-full">
                  <p className="text-amber-800 text-[11px] font-medium leading-relaxed text-left">
                    <span className="font-bold">AI Review:</span> Bạn múa ký
                    hiệu{" "}
                    <b>{apiResult?.label || apiResult?.word || "Chưa rõ"}</b>{" "}
                    thay vì <b>{word}</b>. Hãy xem lại góc nghiêng cổ tay và
                    chuyển động của các ngón tay.
                  </p>
                </div>
              </>
            )}

            {/* Debugging block */}
            {/* <div className="mt-3 p-2 bg-slate-100 rounded text-xs text-left w-full overflow-x-auto border border-slate-200">
              <span className="font-bold block text-slate-500 mb-1">Raw Backend Response (Debug):</span>
              <pre className="text-[10px] text-slate-600">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div> */}

            <button
              onClick={() => setStep("READY")}
              className="mt-auto w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <RefreshCcw size={16} /> Thực hành lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPracticePopup;
