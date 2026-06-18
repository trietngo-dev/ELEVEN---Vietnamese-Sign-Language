import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Trash2, AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function DeleteAccountPage() {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [understandTerms, setUnderstandTerms] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const text = confirmText.trim().toUpperCase();
    setCanDelete(text === "CONFIRM");
  }, [confirmText]);

  const handleDelete = async () => {
    if (!user?.id || !understandTerms || !canDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(user.id);
      // AuthContext will handle logout and redirect, but let's navigate to land page just in case
      navigate("/");
    } catch (err: any) {
      setDeleteError(err.message || "Không thể xóa tài khoản. Vui lòng thử lại sau.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FDF8] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-red-100 shadow-[0_10px_30px_rgba(239,68,68,0.04)]"
      >
        <div>
          <button
            onClick={() => navigate("/ho-so")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Quay lại Hồ sơ
          </button>

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100/50">
              <ShieldAlert size={32} />
            </div>
          </div>

          <h2 className="mt-6 text-center text-xl font-black text-slate-800">
            Hành động này không thể hoàn tác!
          </h2>
          <p className="mt-2 text-center text-xs text-slate-500 leading-relaxed">
            Khi bạn xóa tài khoản, toàn bộ dữ liệu học tập và thông tin cá nhân của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống của chúng tôi.
          </p>
        </div>

        {/* Warning details */}
        <div className="p-5 rounded-2xl bg-red-50/30 border border-red-100/80 text-slate-700 space-y-4">
          <p className="text-xs font-black text-red-700 flex items-center gap-1.5">
            <AlertTriangle size={14} />
            Các thông tin sẽ mất vĩnh viễn:
          </p>
          <ul className="text-xs space-y-2 text-slate-600 font-medium">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              Tiến trình học tập và lịch sử kiểm tra AI
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              Số điểm XP tích lũy và danh hiệu (Badges)
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              Quyền lợi VIP và gói đăng ký dịch vụ hoạt động
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              Thông tin cá nhân, cài đặt và bài học đã lưu
            </li>
          </ul>
        </div>

        {/* Agreement checkbox */}
        <div className="flex items-start gap-3">
          <input
            id="agreement"
            type="checkbox"
            checked={understandTerms}
            onChange={(e) => setUnderstandTerms(e.target.checked)}
            disabled={isDeleting}
            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 mt-0.5 cursor-pointer"
          />
          <label
            htmlFor="agreement"
            className="text-xs text-slate-600 leading-normal font-medium cursor-pointer select-none"
          >
            Tôi hiểu và đồng ý xóa toàn bộ dữ liệu cá nhân của tôi vĩnh viễn.
          </label>
        </div>

        {/* Confirm Text */}
        <div className="space-y-2">
          <label htmlFor="confirm" className="text-xs font-bold text-slate-700 block">
            Nhập chữ "CONFIRM" bên dưới để xác nhận:
          </label>
          <input
            id="confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
            placeholder="Gõ CONFIRM để xác nhận"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-slate-50/50 text-xs font-bold text-slate-800 transition-all outline-none"
          />
        </div>

        {deleteError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 font-semibold text-xs text-center leading-relaxed">
            {deleteError}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={!understandTerms || !canDelete || isDeleting}
            onClick={handleDelete}
            className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/10 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 size={14} />
            {isDeleting ? "Đang xóa tài khoản..." : "Xóa tài khoản vĩnh viễn"}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => navigate("/ho-so")}
            className="w-full h-11 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
          >
            Hủy & Giữ lại tài khoản
          </button>
        </div>
      </motion.div>
    </div>
  );
}
