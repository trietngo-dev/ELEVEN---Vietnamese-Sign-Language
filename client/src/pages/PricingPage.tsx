import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { tokenStorage } from "../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const faqs = [
  {
    question: "Tôi có thể hủy gói đăng ký bất cứ lúc nào không?",
    answer: "Có, bạn có thể hủy gói đăng ký Premium của mình bất cứ lúc nào trong phần cài đặt tài khoản mà không mất phí phát sinh."
  },
  {
    question: "Gói Năm khác gì so với Gói Tháng?",
    answer: "Về tính năng thì cả hai gói đều giống nhau, tuy nhiên Gói Năm giúp bạn tiết kiệm đến 40% chi phí so với việc thanh toán từng tháng."
  }
];

const features = [
  { name: "Bài học Video", free: "Cơ bản", pro: "Toàn bộ khoá học" },
  { name: "Dịch thuật AI", free: "10 lượt/ngày", pro: "Không giới hạn" },
  { name: "Phản hồi từ AI", free: "—", pro: "Chi tiết thời gian thực" },
  { name: "Học ngoại tuyến", free: "—", pro: "Có sẵn" },
  { name: "Luyện tập cùng cộng đồng", free: "Giới hạn", pro: "Ưu tiên kết nối" }
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [activeSub, setActiveSub] = useState<any | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");

    if (status && orderCode) {
      const token = tokenStorage.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Call status endpoint to trigger active sync on backend
      fetch(`${API_BASE_URL}/api/payments/status/${orderCode}`, { headers })
        .then((res) => {
          if (res.ok) {
            // Re-fetch active subscription to update UI
            return fetch(`${API_BASE_URL}/api/user_subscriptions/current`, { headers });
          }
          return null;
        })
        .then((res) => {
          if (res && res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data && data.status === 0) {
            setActiveSub(data);
          }
        })
        .catch((err) => console.error("Lỗi đồng bộ trạng thái thanh toán:", err));

      if (status === "PAID") {
        setPaymentStatus("success");
      } else if (status === "CANCELLED") {
        setPaymentStatus("cancelled");
      }

      // Clean search parameters
      searchParams.delete("status");
      searchParams.delete("orderCode");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Fetch active subscription
    fetch(`${API_BASE_URL}/api/user_subscriptions/current`, { headers })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.status === 0) {
          setActiveSub(data);
        } else {
          setActiveSub(null);
        }
      })
      .catch(() => setActiveSub(null));

    // Fetch subscription plans
    fetch(`${API_BASE_URL}/api/subscription_plans`, { headers })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.items) {
          setPlans(data.items);
        } else if (Array.isArray(data)) {
          setPlans(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpgrade = async (planCode: string) => {
    const plan = plans.find(p => p.code && p.code.toLowerCase() === planCode.toLowerCase());
    if (!plan) {
      alert("Gói thanh toán không tồn tại hoặc chưa được tải.");
      return;
    }

    setIsUpgrading(planCode);
    try {
      const token = tokenStorage.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const returnUrl = `${window.location.origin}/nang-cap?status=PAID`;
      const cancelUrl = `${window.location.origin}/nang-cap?status=CANCELLED`;
      const res = await fetch(`${API_BASE_URL}/api/payments/create-payment-link`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          planId: plan.id,
          returnUrl,
          cancelUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          alert("Không lấy được đường dẫn thanh toán từ PayOS.");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || "Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");
      }
    } catch (err) {
      alert("Đã xảy ra lỗi khi kết nối đến máy chủ.");
    } finally {
      setIsUpgrading(null);
    }
  };

  const isProActive = activeSub && plans.find(p => p.id === activeSub.planId)?.code?.toLowerCase() === "pro";
  const isPremiumActive = activeSub && plans.find(p => p.id === activeSub.planId)?.code?.toLowerCase() === "premium";

  const proPlan = plans.find(p => p.code && p.code.toLowerCase() === "pro");
  const premiumPlan = plans.find(p => p.code && p.code.toLowerCase() === "premium");

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <div className="mx-auto max-w-6xl px-6 py-16">
        
        {paymentStatus === "success" && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="font-bold text-sm">🎉 Thanh toán thành công!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Tài khoản của bạn đã được nâng cấp lên gói dịch vụ mới.</p>
            </div>
            <button onClick={() => setPaymentStatus(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">Đóng</button>
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="font-bold text-sm">❌ Giao dịch đã hủy</p>
              <p className="text-xs text-rose-600 mt-0.5">Yêu cầu thanh toán của bạn đã bị hủy hoặc chưa hoàn tất.</p>
            </div>
            <button onClick={() => setPaymentStatus(null)} className="text-rose-500 hover:text-rose-700 font-bold text-sm">Đóng</button>
          </div>
        )}
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-[#1f2937] tracking-tight mb-4"
          >
            Nâng cấp tài khoản của bạn
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Mở khóa toàn bộ tiềm năng học tập ngôn ngữ ký hiệu với gói Premium và sự hỗ trợ từ trí tuệ nhân tạo.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
          
          {/* Free Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col"
          >
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Gói Cơ bản</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-[#1f2937]">0 VNĐ</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Dành cho người mới bắt đầu</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3c6d44]/10 flex items-center justify-center text-[#3c6d44]"><Check size={12} strokeWidth={3}/></div> Bài học cơ bản
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3c6d44]/10 flex items-center justify-center text-[#3c6d44]"><Check size={12} strokeWidth={3}/></div> Dịch thuật AI giới hạn
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><X size={12} strokeWidth={3}/></div> Phản hồi chi tiết từ AI
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><X size={12} strokeWidth={3}/></div> Truy cập ngoại tuyến
              </li>
            </ul>
            
            {(!isProActive && !isPremiumActive) ? (
              <button disabled className="w-full py-3.5 rounded-2xl bg-[#f8fbfa] text-slate-400 font-bold border border-slate-200">
                Gói hiện tại
              </button>
            ) : (
              <div className="h-[54px]" />
            )}
          </motion.div>

          {/* Pro Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative bg-white rounded-3xl p-8 border-2 border-[#3c6d44] shadow-[0_20px_40px_rgba(60,109,68,0.1)] flex flex-col transform md:-translate-y-4"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3c6d44] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
              Phổ biến nhất
            </div>
            <h3 className="text-sm font-bold text-[#3c6d44] uppercase tracking-wider mb-4">
              {proPlan ? proPlan.name : "Gói Chuyên nghiệp"}
            </h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-[#1f2937]">
                {proPlan ? `${proPlan.priceVnd.toLocaleString("vi-VN")} VNĐ` : "30.000 VNĐ"}
              </span>
              <span className="text-slate-500 text-sm font-medium">
                /{proPlan?.billingCycle === 'yearly' ? 'năm' : 'tháng'}
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Đầy đủ tính năng hàng tháng</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fed963]/30 flex items-center justify-center text-[#d9aa17]"><Check size={12} strokeWidth={4}/></div> Toàn bộ khóa học nâng cao
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fed963]/30 flex items-center justify-center text-[#d9aa17]"><Check size={12} strokeWidth={4}/></div> Dịch thuật AI không giới hạn
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fed963]/30 flex items-center justify-center text-[#d9aa17]"><Check size={12} strokeWidth={4}/></div> Phản hồi chi tiết từ AI
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fed963]/30 flex items-center justify-center text-[#d9aa17]"><Check size={12} strokeWidth={4}/></div> Hỗ trợ ưu tiên
              </li>
            </ul>
            
            {!isProActive && !isPremiumActive ? (
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={isUpgrading !== null}
                className="w-full py-3.5 rounded-2xl font-bold transition-all bg-[#3c6d44] text-white shadow-lg shadow-[#3c6d44]/30 hover:bg-[#315736] hover:scale-[1.02]"
              >
                {isUpgrading === "pro" ? "Đang xử lý..." : "Nâng cấp ngay"}
              </button>
            ) : (
              <div className="h-[54px]" />
            )}
          </motion.div>

          {/* Premium Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col"
          >
            <div className="absolute top-8 right-8 bg-[#fef3c7] text-[#d9aa17] text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
              Tiết kiệm 40%
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              {premiumPlan ? premiumPlan.name : "Gói Cao cấp"}
            </h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-[#1f2937]">
                {premiumPlan ? `${premiumPlan.priceVnd.toLocaleString("vi-VN")} VNĐ` : "50.000 VNĐ"}
              </span>
              <span className="text-slate-500 text-sm font-medium">
                /{premiumPlan?.billingCycle === 'yearly' ? 'năm' : 'tháng'}
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Lựa chọn tốt nhất cho tương lai</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3c6d44]/10 flex items-center justify-center text-[#3c6d44]"><Check size={12} strokeWidth={3}/></div> Tất cả tính năng Pro
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3c6d44]/10 flex items-center justify-center text-[#3c6d44]"><Check size={12} strokeWidth={3}/></div> Truy cập ngoại tuyến
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3c6d44]/10 flex items-center justify-center text-[#3c6d44]"><Check size={12} strokeWidth={3}/></div> Chứng chỉ hoàn thành
              </li>
              <li className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#3c6d44]/10 flex items-center justify-center text-[#3c6d44]"><Check size={12} strokeWidth={3}/></div> Hỗ trợ 1:1 từ chuyên gia
              </li>
            </ul>
            
            <button
              onClick={() => handleUpgrade("premium")}
              disabled={isPremiumActive || isUpgrading !== null}
              className={`w-full py-3.5 rounded-2xl font-bold transition-all ${
                isPremiumActive
                  ? "bg-[#f8fbfa] text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-[#e6ece8] text-[#3c6d44] hover:bg-[#d8e0da] hover:scale-[1.02]"
              }`}
            >
              {isPremiumActive ? "Gói hiện tại" : isUpgrading === "premium" ? "Đang xử lý..." : "Nâng cấp ngay"}
            </button>
          </motion.div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-2xl font-bold text-[#1f2937] mb-8">So sánh các tính năng</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3">Tính năng</th>
                  <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3">Cơ bản</th>
                  <th className="py-4 px-2 text-xs font-bold text-[#3c6d44] uppercase tracking-widest w-1/3">Chuyên nghiệp</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-2 text-sm font-semibold text-slate-700">{feature.name}</td>
                    <td className="py-5 px-2 text-sm text-slate-500">{feature.free}</td>
                    <td className="py-5 px-2 text-sm font-semibold text-[#3c6d44]">{feature.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-[#1f2937] mb-8 text-center">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`border rounded-2xl bg-white transition-all overflow-hidden ${openFaq === idx ? 'border-[#3c6d44] shadow-md' : 'border-slate-100'}`}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <span className="font-bold text-[#1f2937] text-sm md:text-base pr-4">{faq.question}</span>
                  <ChevronDown className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-[#3c6d44]' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
