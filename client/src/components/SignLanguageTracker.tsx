import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  HolisticLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

// === CÁC HẰNG SỐ CHUẨN MỚI NHẤT ===
const HAND_LANDMARK_COUNT = 21;
const TARGET_FRAME_COUNT = 50;

const SELECTED_POSE_INDICES = [0, 11, 12, 13, 14, 15, 16, 23, 24]; // 9 điểm
const SELECTED_FACE_INDICES = [
  // 51 điểm
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317,
  14, 87, 178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 46, 53, 52,
  65, 55, 70, 63, 105, 66, 107, 276, 283, 282, 295, 285, 300, 293, 334, 296,
  336,
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5048";
const EXTRACT_FEATURES_ENDPOINT = `${API_BASE_URL}/api/gesture/extract-features`;
const PREDICT_ENDPOINT = `${API_BASE_URL}/api/gesture/predict`;
const CONFIDENCE_THRESHOLD = 0.7;
const HAND_SMOOTHING_ALPHA = 0.35;
const MAX_HAND_HOLD_FRAMES = 4;

// === TYPE MỚI: HOÀN TOÀN BỎ VISIBILITY ===
type Keypoint = {
  x: number;
  y: number;
  z: number;
};

type FrameKeypoints = {
  pose: Keypoint[];
  face: Keypoint[];
  leftHand: Keypoint[];
  rightHand: Keypoint[];
};

type ExtractFeaturesResponse = {
  features: number[];
  frameCount: number;
  totalFeatures: number;
  status: string;
};

type PredictApiResponse = {
  word?: string;
  message?: string;
  confidence?: number;
  predictedId?: number;
  label?: string;
  probabilities?: Record<string, number>;
};

const SignLanguageTracker = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCollectingRef = useRef(false);
  const frameBufferRef = useRef<FrameKeypoints[]>([]);
  const prevLeftHandRef = useRef<Keypoint[] | null>(null);
  const prevRightHandRef = useRef<Keypoint[] | null>(null);
  const missingLeftHandFramesRef = useRef(0);
  const missingRightHandFramesRef = useRef(0);

  const [capturedFrames, setCapturedFrames] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(
    "Sẵn sàng test gửi keypoints",
  );
  const [backendResult, setBackendResult] = useState<PredictApiResponse | null>(
    null,
  );

  const isInitializing = useRef(false);

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
  ): FrameKeypoints => {
    const pose: Keypoint[] = [];
    const face: Keypoint[] = [];
    const leftHand: Keypoint[] = [];
    const rightHand: Keypoint[] = [];

    // 1. POSE (9 điểm)
    const rawPose = results.poseLandmarks?.[0] ?? [];
    if (rawPose.length > 0) {
      for (const index of SELECTED_POSE_INDICES) {
        const p = rawPose[index];
        pose.push(toKeypoint(p ? { ...p, x: 1 - p.x } : undefined));
      }
    } else {
      for (let i = 0; i < SELECTED_POSE_INDICES.length; i += 1)
        pose.push(toKeypoint(undefined));
    }

    // 2. FACE (51 điểm)
    const rawFace = results.faceLandmarks?.[0] ?? [];
    if (rawFace.length > 0) {
      for (const index of SELECTED_FACE_INDICES) {
        const p = rawFace[index];
        face.push(toKeypoint(p ? { ...p, x: 1 - p.x } : undefined));
      }
    } else {
      for (let i = 0; i < SELECTED_FACE_INDICES.length; i += 1)
        face.push(toKeypoint(undefined));
    }

    // 3. HANDS (Swap and Mirror)
    const rawRightAsLeft = (results.rightHandLandmarks?.[0] ?? []).map((p) => ({
      ...p,
      x: 1 - p.x,
    }));
    leftHand.push(
      ...getHandKeypoints(
        rawRightAsLeft,
        prevLeftHandRef,
        missingLeftHandFramesRef,
      ),
    );

    const rawLeftAsRight = (results.leftHandLandmarks?.[0] ?? []).map((p) => ({
      ...p,
      x: 1 - p.x,
    }));
    rightHand.push(
      ...getHandKeypoints(
        rawLeftAsRight,
        prevRightHandRef,
        missingRightHandFramesRef,
      ),
    );

    // 4. CHUẨN HÓA LẤY MŨI LÀM GỐC
    const nose = pose[0] ?? toKeypoint(undefined);
    const normalizeByNose = (point: Keypoint): Keypoint => {
      if (point.x === 0 && point.y === 0 && point.z === 0) return point;
      return {
        ...point,
        x: point.x - nose.x,
        y: point.y - nose.y,
        z: point.z - nose.z,
      };
    };

    return {
      pose: pose.map(normalizeByNose),
      face: face.map(normalizeByNose),
      leftHand: leftHand.map(normalizeByNose),
      rightHand: rightHand.map(normalizeByNose),
    };
  };

  const sendFramesToBackend = async (frames: FrameKeypoints[]) => {
    setUploadStatus("Đang gửi 50 frame sang BE để extract features...");

    try {
      const extractResponse = await fetch(EXTRACT_FEATURES_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });

      if (!extractResponse.ok) {
        const errorText = await extractResponse.text();
        throw new Error(
          `Extract features failed HTTP ${extractResponse.status}: ${errorText}`,
        );
      }

      const extracted =
        (await extractResponse.json()) as ExtractFeaturesResponse;

      if (
        !Array.isArray(extracted.features) ||
        extracted.features.length === 0
      ) {
        throw new Error("Extracted features is empty");
      }

      setUploadStatus(
        `Đã extract ${extracted.totalFeatures} features, đang predict...`,
      );

      const response = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: extracted.features }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as PredictApiResponse;
      setBackendResult(data);

      const predictedWord = data.word ?? data.label ?? "";
      const predictedConfidence = data.confidence ?? 0;

      if (!predictedWord) {
        setUploadStatus(data.message ?? "Chưa rõ cử chỉ");
        return;
      }

      if (predictedConfidence < CONFIDENCE_THRESHOLD) {
        setUploadStatus(
          `KQ thấp: ${predictedWord} (${(predictedConfidence * 100).toFixed(2)}%). Cần > 70% để hiển thị kết quả chính thức.`,
        );
        return;
      }

      setUploadStatus(
        `KQ: ${predictedWord} - độ tin cậy ${(predictedConfidence * 100).toFixed(2)}%`,
      );
    } catch (error) {
      console.error("Gửi keypoints thất bại:", error);
      setUploadStatus("Gửi thất bại. Kiểm tra endpoint/backend rồi thử lại");
    }
  };

  const startCaptureAndSend = () => {
    frameBufferRef.current = [];
    prevLeftHandRef.current = null;
    prevRightHandRef.current = null;
    missingLeftHandFramesRef.current = 0;
    missingRightHandFramesRef.current = 0;
    isCollectingRef.current = true;
    setCapturedFrames(0);
    setBackendResult(null);
    setUploadStatus("Bắt đầu thu 50 frame...");
  };

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    let holisticLandmarker: HolisticLandmarker;
    let animationId: number;
    let cameraStream: MediaStream | null = null;

    const setupHolistic = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

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

        console.log("AI Model đã tải thành công!");
        await startCamera();
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };

    const startCamera = async () => {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 60 },
            facingMode: "user",
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            predictWebcam();
          };
        }
      } catch (err) {
        console.error("Không tìm thấy camera:", err);
      }
    };

    const predictWebcam = () => {
      if (!videoRef.current || !canvasRef.current || !holisticLandmarker)
        return;

      const canvasCtx = canvasRef.current.getContext("2d");
      if (!canvasCtx) return;
      const drawingUtils = new DrawingUtils(canvasCtx);

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      const startTimeMs = performance.now();
      const results = holisticLandmarker.detectForVideo(
        videoRef.current,
        startTimeMs,
      );

      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      canvasCtx.save();
      canvasCtx.translate(canvasRef.current.width, 0);
      canvasCtx.scale(-1, 1);

      canvasCtx.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

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

      canvasCtx.restore();

      if (isCollectingRef.current) {
        const frameKeypoints = extractFrameKeypoints(results);
        frameBufferRef.current.push(frameKeypoints);

        const currentFrames = frameBufferRef.current.length;
        setCapturedFrames(currentFrames);

        if (currentFrames >= TARGET_FRAME_COUNT) {
          isCollectingRef.current = false;
          const payload = frameBufferRef.current.slice(0, TARGET_FRAME_COUNT);
          void sendFramesToBackend(payload);
        }
      }

      animationId = window.requestAnimationFrame(predictWebcam);
    };

    setupHolistic();

    return () => {
      console.log("Cleanup...");
      isInitializing.current = false;
      cancelAnimationFrame(animationId);
      holisticLandmarker?.close();
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          flex: "0 1 560px",
          width: "560px",
          maxWidth: "100%",
          height: "auto",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
        }}
      />
      <div
        style={{
          flex: "0 1 360px",
          width: 360,
          maxWidth: "100%",
          textAlign: "left",
        }}
      >
        <button
          type="button"
          onClick={startCaptureAndSend}
          disabled={isCollectingRef.current}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            cursor: isCollectingRef.current ? "not-allowed" : "pointer",
            backgroundColor: isCollectingRef.current ? "#e5e7eb" : "#111827",
            color: isCollectingRef.current ? "#6b7280" : "#ffffff",
          }}
        >
          {isCollectingRef.current
            ? "Đang thu dữ liệu..."
            : "Test gửi 50 frame"}
        </button>
        <p style={{ marginTop: 8, fontSize: 14 }}>
          Frame đã thu: {capturedFrames}/50
        </p>
        <p style={{ marginTop: 4, fontSize: 14 }}>{uploadStatus}</p>

        {backendResult && (
          <div
            style={{
              marginTop: 8,
              padding: 12,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              textAlign: "left",
              backgroundColor: "#f9fafb",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>Kết quả từ BE</p>
            <p style={{ margin: "6px 0 0", fontSize: 14 }}>
              Word: {backendResult.word ?? backendResult.label ?? ""}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 14 }}>
              Message: {backendResult.message ?? "(không có)"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 14 }}>
              Confidence: {((backendResult.confidence ?? 0) * 100).toFixed(2)}%
            </p>
            {backendResult.probabilities && (
              <pre
                style={{
                  margin: "8px 0 0",
                  fontSize: 12,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                Probabilities:{" "}
                {JSON.stringify(backendResult.probabilities, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignLanguageTracker;
