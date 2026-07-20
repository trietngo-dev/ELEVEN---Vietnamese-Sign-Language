import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { Button } from "./ui/button";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl z-10 border border-slate-100"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-2">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <LogOut size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-800">Đăng xuất tài khoản</h3>
              <p className="mb-6 text-sm text-slate-500 px-2 leading-relaxed">
                Bạn có chắc chắn muốn đăng xuất khỏi Eleven? Phiên làm việc hiện tại của bạn sẽ kết thúc.
              </p>
              
              <div className="flex w-full gap-3">
                <Button 
                  variant="ghost" 
                  onClick={onClose} 
                  className="flex-1 font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 h-11 rounded-2xl"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }} 
                  className="flex-1 bg-red-500 hover:bg-red-600 font-bold text-white shadow-md shadow-red-500/20 h-11 rounded-2xl"
                >
                  Đăng xuất
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
