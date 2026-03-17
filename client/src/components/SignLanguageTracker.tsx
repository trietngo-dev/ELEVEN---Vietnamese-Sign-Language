import { useEffect, useRef, useState } from "react";
import {
  HolisticLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const POSE_LANDMARK_COUNT = 33;
const HAND_LANDMARK_COUNT = 21;
const VALUES_PER_FRAME = POSE_LANDMARK_COUNT * 4 + HAND_LANDMARK_COUNT * 3 * 2; // 258
const TARGET_FRAME_COUNT = 80;
const TARGET_KEYPOINTS_COUNT = VALUES_PER_FRAME * TARGET_FRAME_COUNT; // 20,640
const TEST_POST_URL =
  import.meta.env.VITE_KEYPOINTS_TEST_URL ??
  "http://localhost:8000/api/v1/motion-check/keypoints/test";

const SignLanguageTracker = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCollectingRef = useRef(false);
  const frameBufferRef = useRef<number[]>([]);

  const [capturedFrames, setCapturedFrames] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(
    "Sẵn sàng test gửi keypoints",
  );

  // Dùng Ref để theo dõi trạng thái khởi tạo giữa các lần render
  const isInitializing = useRef(false);

  const toFiniteNumber = (value: unknown) => {
    const num = typeof value === "number" ? value : 0;
    return Number.isFinite(num) ? num : 0;
  };

  const extractFrameKeypoints = (
    results: ReturnType<HolisticLandmarker["detectForVideo"]>,
  ) => {
    const frame: number[] = [];

    const poseLandmarks = results.poseLandmarks?.[0] ?? [];
    for (let i = 0; i < POSE_LANDMARK_COUNT; i += 1) {
      const point = poseLandmarks[i];
      frame.push(
        toFiniteNumber(point?.x),
        toFiniteNumber(point?.y),
        toFiniteNumber(point?.z),
        toFiniteNumber(point?.visibility),
      );
    }

    const leftHandLandmarks = results.leftHandLandmarks?.[0] ?? [];
    for (let i = 0; i < HAND_LANDMARK_COUNT; i += 1) {
      const point = leftHandLandmarks[i];
      frame.push(
        toFiniteNumber(point?.x),
        toFiniteNumber(point?.y),
        toFiniteNumber(point?.z),
      );
    }

    const rightHandLandmarks = results.rightHandLandmarks?.[0] ?? [];
    for (let i = 0; i < HAND_LANDMARK_COUNT; i += 1) {
      const point = rightHandLandmarks[i];
      frame.push(
        toFiniteNumber(point?.x),
        toFiniteNumber(point?.y),
        toFiniteNumber(point?.z),
      );
    }

    return frame;
  };

  const sendKeypointsToBackend = async (keypoints: number[]) => {
    setUploadStatus("Đang gửi dữ liệu 80 frame lên backend...");

    try {
      const response = await fetch(TEST_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keypoints }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setUploadStatus(`Gửi thành công ${keypoints.length} số tới BE`);
    } catch (error) {
      console.error("Gửi keypoints thất bại:", error);
      setUploadStatus("Gửi thất bại. Kiểm tra endpoint/backend rồi thử lại");
    }
  };

  const startCaptureAndSend = () => {
    frameBufferRef.current = [];
    isCollectingRef.current = true;
    setCapturedFrames(0);
    setUploadStatus("Bắt đầu thu 80 frame...");
  };

  useEffect(() => {
    // Nếu đang khởi tạo rồi thì không chạy lại nữa (chống React Strict Mode 2 lần)
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
          video: { width: 1280, height: 720, facingMode: "user" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            predictWebcam();
          };
        }
      } catch (err) {
        console.error("Không tìm thấy camera hoặc bị từ chối:", err);
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

      // Mirror the whole drawing to reverse camera direction.
      canvasCtx.save();
      canvasCtx.translate(canvasRef.current.width, 0);
      canvasCtx.scale(-1, 1);

      // Draw live camera frame first, then overlay landmarks.
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
        frameBufferRef.current.push(...frameKeypoints);

        const currentFrames = Math.floor(
          frameBufferRef.current.length / VALUES_PER_FRAME,
        );
        setCapturedFrames(currentFrames);

        if (frameBufferRef.current.length >= TARGET_KEYPOINTS_COUNT) {
          isCollectingRef.current = false;
          const payload = frameBufferRef.current.slice(
            0,
            TARGET_KEYPOINTS_COUNT,
          );
          void sendKeypointsToBackend(payload);
        }
      }

      animationId = window.requestAnimationFrame(predictWebcam);
    };

    setupHolistic();

    // Cleanup function: Rất quan trọng để giải phóng camera
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
    <div style={{ position: "relative", textAlign: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
      <div style={{ marginTop: 12 }}>
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
            : "Test gửi 80 frame"}
        </button>
        <p style={{ marginTop: 8, fontSize: 14 }}>
          Frame đã thu: {capturedFrames}/80
        </p>
        <p style={{ marginTop: 4, fontSize: 14 }}>{uploadStatus}</p>
        <p style={{ marginTop: 4, fontSize: 12, color: "#4b5563" }}>
          Endpoint test: {TEST_POST_URL}
        </p>
      </div>
    </div>
  );
};

export default SignLanguageTracker;
