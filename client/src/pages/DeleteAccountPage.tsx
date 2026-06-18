import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from "../lib/auth";

type Step = "email" | "code" | "done";

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [understandTerms, setUnderstandTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canRequestCode = normalizedEmail.length > 3 && normalizedEmail.includes("@");
  const canConfirm = canRequestCode && code.trim().length >= 4 && understandTerms;

  const requestCode = async () => {
    if (!canRequestCode) return;

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await authApi.requestAccountDeletionOtp({ email: normalizedEmail });
      setStep("code");
      setMessage("Nếu email tồn tại trong hệ thống, mã xác nhận đã được gửi đến hộp thư của bạn.");
    } catch (err: any) {
      setError(err.message || "Không thể gửi mã xác nhận. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletion = async () => {
    if (!canConfirm) return;

    setIsSubmitting(true);
    setError("");

    try {
      await authApi.confirmAccountDeletion({
        email: normalizedEmail,
        code: code.trim()
      });
      setStep("done");
      setMessage("Tài khoản đã được xóa thành công.");
    } catch (err: any) {
      setError(err.message || "Không thể xác nhận xóa tài khoản. Vui lòng kiểm tra lại mã.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEmail = () => {
    setStep("email");
    setCode("");
    setUnderstandTerms(false);
    setMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F8FDF8] px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-[0_10px_30px_rgba(239,68,68,0.05)] sm:p-8"
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft size={14} />
          Về trang chủ
        </button>

        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
            {step === "done" ? <CheckCircle2 size={32} /> : <ShieldCheck size={32} />}
          </div>
        </div>

        <h1 className="mt-6 text-center text-xl font-black text-slate-800">
          {step === "done" ? "Đã xóa tài khoản" : "Xóa tài khoản Sign Language Eleven"}
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          {step === "done"
            ? "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi."
            : "Nhập email tài khoản, nhận mã xác nhận, rồi xác nhận lần cuối để xóa dữ liệu."}
        </p>

        {step !== "done" && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50/50 p-4">
            <p className="flex items-center gap-2 text-xs font-black text-red-700">
              <AlertTriangle size={14} />
              Dữ liệu sẽ bị xóa vĩnh viễn
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Tiến trình học tập, lịch sử luyện tập, thông tin cá nhân và các dữ liệu liên quan đến tài khoản sẽ không thể khôi phục.
            </p>
          </div>
        )}

        {step === "email" && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="delete-email" className="block text-xs font-bold text-slate-700">
                Email tài khoản
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="delete-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!canRequestCode || isSubmitting}
              onClick={requestCode}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-extrabold text-white shadow-md shadow-red-600/10 transition-all hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              <Mail size={14} />
              {isSubmitting ? "Đang gửi mã..." : "Gửi mã xác nhận"}
            </button>
          </div>
        )}

        {step === "code" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600">
              Email: <span className="text-slate-900">{normalizedEmail}</span>
              <button
                type="button"
                onClick={resetEmail}
                disabled={isSubmitting}
                className="ml-2 font-black text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Đổi
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="delete-code" className="block text-xs font-bold text-slate-700">
                Mã xác nhận
              </label>
              <input
                id="delete-code"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                disabled={isSubmitting}
                placeholder="Nhập mã trong email"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-center text-lg font-black tracking-[0.2em] text-slate-800 outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <label className="flex cursor-pointer select-none items-start gap-3 text-xs font-medium leading-5 text-slate-600">
              <input
                type="checkbox"
                checked={understandTerms}
                onChange={(event) => setUnderstandTerms(event.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              Tôi chắc chắn muốn xóa tài khoản này và hiểu rằng thao tác không thể hoàn tác.
            </label>

            <button
              type="button"
              disabled={!canConfirm || isSubmitting}
              onClick={confirmDeletion}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-extrabold text-white shadow-md shadow-red-600/10 transition-all hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              <Trash2 size={14} />
              {isSubmitting ? "Đang xóa tài khoản..." : "Xác nhận xóa tài khoản"}
            </button>
          </div>
        )}

        {step === "done" && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 h-11 w-full rounded-xl bg-emerald-600 text-xs font-extrabold text-white shadow-md shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-95"
          >
            Hoàn tất
          </button>
        )}

        {(message || error) && (
          <div
            className={`mt-5 rounded-xl border p-3 text-center text-xs font-semibold leading-5 ${
              error
                ? "border-red-100 bg-red-50 text-red-600"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}
      </motion.div>
    </div>
  );
}
