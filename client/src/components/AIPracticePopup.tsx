import React, {
  useState,
  useEffect,
  useRef,
  type MutableRefObject,
} from "react";
import { Camera, CheckCircle, RefreshCcw, Info, Loader2, Sparkles, XCircle } from "lucide-react";
import {
  HolisticLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

interface AIPracticePopupProps {
  word: string;
  onSuccess?: (score: number) => void;
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

const AIPracticePopup: React.FC<AIPracticePopupProps> = ({ word, onSuccess }) => {
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

    // Vẽ khung xương neon mờ giống camera gối đầu
    const drawingUtils = new DrawingUtils(canvasCtx);
    if (results.poseLandmarks?.[0]) {
      drawingUtils.drawConnectors(
        results.poseLandmarks[0],
        HolisticLandmarker.POSE_CONNECTIONS,
        { color: "#00FFCC60", lineWidth: 1.5 },
      );
    }
    if (results.leftHandLandmarks?.[0]) {
      drawingUtils.drawConnectors(
        results.leftHandLandmarks[0],
        HolisticLandmarker.HAND_CONNECTIONS,
        { color: "#FF2A85C0", lineWidth: 2 },
      );
    }
    if (results.rightHandLandmarks?.[0]) {
      drawingUtils.drawConnectors(
        results.rightHandLandmarks[0],
        HolisticLandmarker.HAND_CONNECTIONS,
        { color: "#FF2A85C0", lineWidth: 2 },
      );
    }
    canvasCtx.restore();

    // Lưu frame data & Chuẩn hóa đỉnh mũi cực kì quan trọng!
    const frameKeypoints = extractFrameKeypoints(results);
    const normalizedKeypoints = normalizeSpatial(frameKeypoints);
    frameBufferRef.current.push(normalizedKeypoints);
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
    apiResult.confidence >= 0.70; // Tăng lên 70% khớp tuyệt đối

  const confidenceScore = apiResult?.confidence
    ? Math.round(apiResult.confidence * 100)
    : 0;

  useEffect(() => {
    if (step === "RESULT" && isMatch && onSuccess) {
      onSuccess(confidenceScore);
    }
  }, [step, isMatch, confidenceScore, onSuccess]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl font-sans text-slate-100 min-h-[460px]">
      {/* Header trạng thái */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#efca4c]" />
          <h3 className="font-extrabold text-white text-sm tracking-wide uppercase truncate max-w-[150px]">
            {word}
          </h3>
        </div>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
          step === "READY" ? "bg-slate-800 text-slate-300" :
          step === "INITIALIZING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
          step === "COUNTDOWN" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse" :
          step === "RECORDING" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
          step === "ANALYZING" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
          "bg-emerald-500 text-white"
        }`}>
          {step === "READY" && "Sẵn sàng"}
          {step === "INITIALIZING" && "Đang tải AI..."}
          {step === "COUNTDOWN" && "Chuẩn bị"}
          {step === "RECORDING" && "Đang ghi hình"}
          {step === "ANALYZING" && "Đang phân tích"}
          {step === "RESULT" && "Kết quả"}
        </span>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-[#090d16]">
        {/* Render ẩn video và canvas */}
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas
          ref={canvasRef}
          className={
            step === "COUNTDOWN" || step === "RECORDING"
              ? "w-full h-full object-contain aspect-square scale-x-[-1] drop-shadow-2xl"
              : "hidden"
          }
        />

        {step === "READY" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#1e293b]/30 to-[#0f172a]/60">
            <div className="w-16 h-16 rounded-full bg-[#3c6d44]/10 border border-[#3c6d44]/30 flex items-center justify-center mb-6 shadow-inner relative">
              <Camera size={26} className="text-[#4e8b58] animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-dashed border-[#3c6d44]/40 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <h4 className="font-extrabold text-base text-white tracking-wide mb-2.5">
              Sẵn sàng thực hành chưa?
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-8">
              Bạn có 3 giây chuẩn bị, và ~2 giây để thực hiện ký hiệu trước camera. Hệ thống sẽ tự động quét cơ thể bạn.
            </p>
            <button
              onClick={startPractice}
              className="bg-gradient-to-r from-[#3c6d44] to-[#4e8b58] hover:from-[#315736] hover:to-[#3e7248] text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-[#3c6d44]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 text-sm"
            >
              <Camera size={18} /> Bắt đầu ngay
            </button>
          </div>
        )}

        {step === "INITIALIZING" && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
            <div className="relative mb-6">
              <Loader2 size={44} className="text-[#3c6d44] animate-spin" />
              <div className="absolute inset-0 size-11 border-2 border-dashed border-slate-700 rounded-full scale-125 animate-ping opacity-30" />
            </div>
            <h4 className="font-bold text-sm text-white tracking-wide">
              Đang kết nối camera và thiết lập AI...
            </h4>
            <p className="text-[11px] text-slate-400 mt-2">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {(step === "COUNTDOWN" || step === "RECORDING") && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-transparent pointer-events-none">
            {step === "COUNTDOWN" && (
              <div className="absolute inset-0 bg-[#090d16]/75 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto">
                <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#efca4c] to-amber-500 drop-shadow-[0_0_20px_rgba(239,202,76,0.3)] animate-bounce">
                  {countdown}
                </span>
                <span className="text-white text-xs font-black tracking-[0.25em] mt-4 uppercase">
                  Bắt đầu sau...
                </span>
              </div>
            )}

            {step === "RECORDING" && (
              <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
                <div className="bg-rose-500/90 text-white px-4 py-1.5 rounded-full font-black text-[10px] tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-rose-900/30 border border-rose-400/20">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div> 
                  Đang thu thập cử chỉ ({progress}/{TARGET_FRAME_COUNT})
                </div>
              </div>
            )}
            
            {/* Progress bar at the bottom */}
            {step === "RECORDING" && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-[#3c6d44] transition-all duration-75"
                  style={{ width: `${(progress / TARGET_FRAME_COUNT) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {step === "ANALYZING" && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
            <Loader2 size={44} className="text-[#3c6d44] animate-spin mb-6" />
            <h4 className="font-bold text-sm text-white tracking-wide">AI đang dịch cử chỉ của bạn...</h4>
            <p className="text-[11px] text-slate-400 mt-2 max-w-[240px] leading-relaxed">
              Các tọa độ trích xuất đang được đối chiếu với từ điển mô hình ngôn ngữ ký hiệu.
            </p>
          </div>
        )}

        {step === "RESULT" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1e293b]/40 to-[#0f172a]/70">
            {isMatch ? (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                {/* Score Circle Progress */}
                <div className="relative size-24 mb-6 flex items-center justify-center">
                  <svg className="size-full -rotate-90">
                    <circle cx="48" cy="48" r="42" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                    <circle cx="48" cy="48" r="42" stroke="#3c6d44" strokeWidth="6" fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - confidenceScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white">{confidenceScore}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Khớp</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 mb-3">
                  <CheckCircle size={14} /> Ký hiệu chính xác
                </div>
                <h4 className="text-lg font-extrabold text-white">Rất tốt, bạn đã vượt qua!</h4>
                <p className="text-slate-400 mt-2 text-xs leading-relaxed max-w-[280px]">
                  Dáng cử chỉ tay và nhịp điệu của bạn khớp cực kì chuẩn xác với từ mẫu.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full animate-in zoom-in-95 duration-300">
                <div className="size-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
                  <XCircle size={32} className="text-rose-500" />
                </div>
                
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20 mb-3">
                  <Info size={14} /> Chưa chuẩn xác
                </div>
                <h4 className="text-base font-extrabold text-white">Cần điều chỉnh thêm động tác</h4>
                
                <div className="bg-[#1e293b]/55 border border-slate-800 rounded-xl p-3.5 mt-4 w-full text-left">
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <span className="font-bold text-[#efca4c]">AI Nhận xét:</span> Bạn đã ký hiệu sang từ <b>"{apiResult?.label || apiResult?.word || "Không rõ"}"</b> (với độ tự tin {confidenceScore}%) thay vì <b>"{word}"</b>. Hãy điều chỉnh lại dáng ngón tay và góc xoay vai thật dứt khoát nhé.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep("READY")}
              className="mt-6 w-full bg-[#1e293b] hover:bg-[#334155] border border-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all hover:scale-[1.01]"
            >
              <RefreshCcw size={14} /> Thực hành lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPracticePopup;
