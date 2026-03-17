import { useEffect, useRef } from "react";
import {
  HolisticLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const SignLanguageTracker = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dùng Ref để theo dõi trạng thái khởi tạo giữa các lần render
  const isInitializing = useRef(false);

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

      const canvasCtx = canvasRef.current.getContext("2d")!;
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
      <canvas
        ref={canvasRef}
        style={{ maxWidth: "100%", height: "auto", background: "#000" }}
      />
    </div>
  );
};

export default SignLanguageTracker;
