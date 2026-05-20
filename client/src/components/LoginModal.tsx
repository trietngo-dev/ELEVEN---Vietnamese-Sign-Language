import { motion, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginModal({ isOpen, onClose, message = "Bạn cần đăng nhập để tiếp tục thao tác này." }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl z-10"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                <Lock size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">Yêu cầu đăng nhập</h3>
              <p className="mb-6 text-sm text-slate-500">{message}</p>
              
              <div className="flex w-full flex-col gap-3">
                <Link to="/dang-nhap" className="w-full">
                  <Button className="w-full bg-[#3b7948] hover:bg-[#336a40] font-bold text-white shadow-md">
                    Đăng nhập ngay
                  </Button>
                </Link>
                <Link to="/dang-ky" className="w-full">
                  <Button variant="outline" className="w-full font-bold">
                    Tạo tài khoản mới
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
