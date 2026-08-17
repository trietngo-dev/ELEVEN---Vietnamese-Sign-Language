import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Info, CheckCircle2, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  icon,
  isLoading = false,
}: ConfirmModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-50 text-red-500 border border-red-100",
          confirmBtn: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20",
          defaultIcon: <Trash2 size={24} className="stroke-[2.2]" />,
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 text-amber-500 border border-amber-100",
          confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20",
          defaultIcon: <AlertTriangle size={24} className="stroke-[2.2]" />,
        };
      case "success":
        return {
          iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
          confirmBtn: "bg-[#2d6a4f] hover:bg-[#255c43] text-white shadow-md shadow-emerald-700/20",
          defaultIcon: <CheckCircle2 size={24} className="stroke-[2.2]" />,
        };
      case "info":
      default:
        return {
          iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
          confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20",
          defaultIcon: <Info size={24} className="stroke-[2.2]" />,
        };
    }
  };

  const styles = getVariantStyles();

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl z-10 border border-slate-100 text-center flex flex-col items-center"
          >
            {/* Close Button */}
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            )}

            {/* Icon Header */}
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${styles.iconBg}`}>
              {icon || styles.defaultIcon}
            </div>

            {/* Title & Message */}
            <h3 className="mb-2 text-lg sm:text-xl font-black text-slate-800 leading-snug">
              {title}
            </h3>
            <div className="mb-6 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed px-2">
              {message}
            </div>

            {/* Action Buttons */}
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={onClose}
                className="flex-1 font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 h-11 rounded-2xl text-xs sm:text-sm"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  await onConfirm();
                }}
                className={`flex-1 font-bold h-11 rounded-2xl text-xs sm:text-sm transition-all ${styles.confirmBtn}`}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
