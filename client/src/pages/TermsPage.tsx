import React from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, AlertTriangle, Eye, Scale } from "lucide-react";

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fdf8] to-[#edf6e4] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex p-3.5 bg-[#3c6c44]/10 rounded-2xl text-[#3c6c44] mb-4 border border-[#3c6c44]/20 shadow-sm">
            <FileText size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Điều Khoản Dịch Vụ
          </h1>
          <p className="mt-3 text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
            Các điều khoản này điều chỉnh việc sử dụng nền tảng Eleven của bạn. Vui lòng đọc kỹ thông tin dưới đây.
          </p>
        </motion.div>

        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-[0_10px_40px_rgba(41,97,61,0.03)] space-y-8"
        >
          
          {/* Welcome/Introduction */}
          <div className="border-b border-slate-100 pb-6">
            <p className="text-slate-600 text-sm leading-relaxed">
              Các Điều khoản Dịch vụ này điều chỉnh việc bạn sử dụng nền tảng <strong>Eleven</strong>, bao gồm website, ứng dụng và các dịch vụ liên quan do Eleven cung cấp.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mt-3">
              Bằng việc truy cập hoặc sử dụng Eleven, bạn đồng ý tuân thủ các Điều khoản Dịch vụ này và các quy định pháp luật hiện hành. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng nền tảng.
            </p>
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 text-amber-800 text-xs flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <span>
                Eleven có quyền cập nhật hoặc sửa đổi các Điều khoản Dịch vụ vào bất kỳ thời điểm nào. Các thay đổi sẽ có hiệu lực kể từ thời điểm được công bố trên nền tảng.
              </span>
            </div>
          </div>

          {/* Section 1: Giới hạn sử dụng */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">1</span>
              Giới hạn sử dụng
            </h2>
            <p className="text-slate-500 text-xs">
              Khi sử dụng Eleven, bạn đồng ý không thực hiện các hành vi sau:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
              {[
                "Sao chép, chỉnh sửa, phân phối hoặc khai thác trái phép nội dung thuộc nền tảng.",
                "Can thiệp, làm gián đoạn hoặc gây ảnh hưởng đến hoạt động của hệ thống.",
                "Sử dụng dịch vụ cho các hoạt động vi phạm pháp luật hiện hành.",
                "Phát tán nội dung mang tính xúc phạm, quấy rối, lừa đảo hoặc gây hại.",
                "Thu thập trái phép thông tin dữ liệu của người dùng khác.",
                "Ảnh hưởng xấu đến quyền riêng tư hoặc sở hữu trí tuệ của bên thứ ba."
              ].map((item, idx) => (
                <li key={idx} className="flex gap-2.5 items-start p-3 bg-slate-50 rounded-xl hover:bg-[#3c6c44]/5 transition-colors border border-slate-100">
                  <CheckCircle2 size={15} className="text-[#3c6c44] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2: Quyền sở hữu trí tuệ */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">2</span>
              Quyền sở hữu trí tuệ
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Toàn bộ nội dung trên Eleven bao gồm bài học, video, hình ảnh, thiết kế giao diện, dữ liệu, phần mềm và các tài liệu liên quan đều thuộc quyền sở hữu của Eleven hoặc các đối tác được cấp phép.
              </p>
              <p>
                Người dùng chỉ được sử dụng nội dung cho mục đích học tập và sử dụng cá nhân, không nhằm mục đích thương mại.
              </p>
            </div>
          </section>

          {/* Section 3: Dịch vụ AI */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">3</span>
              Dịch vụ AI (Trí tuệ nhân tạo)
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Một số tính năng của Eleven sử dụng trí tuệ nhân tạo (AI) để hỗ trợ học Ngôn ngữ Ký hiệu Việt Nam (VSL), nhận diện ký hiệu qua camera và dịch thuật giao tiếp.
              </p>
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/30 text-blue-800 text-xs flex gap-2.5">
                <Eye className="text-blue-600 shrink-0 mt-0.5" size={15} />
                <span>
                  Các kết quả phân tích do AI cung cấp chỉ mang tính chất tham khảo, hỗ trợ học tập và có thể không chính xác tuyệt đối trong mọi trường hợp ngữ cảnh thực tế.
                </span>
              </div>
            </div>
          </section>

          {/* Section 4: Trách nhiệm pháp lý */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">4</span>
              Trách nhiệm pháp lý
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Eleven được cung cấp trên cơ sở <strong>"nguyên trạng"</strong>. Chúng tôi không đưa ra bất kỳ bảo đảm nào về việc dịch vụ sẽ luôn luôn không bị gián đoạn, không có lỗi phần mềm hoặc hoàn toàn phù hợp với mọi mong muốn cụ thể của bạn.
              </p>
              <p>
                Trong phạm vi pháp luật cho phép, Eleven sẽ không chịu trách nhiệm đối với bất kỳ tổn thất trực tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng hoặc không thể truy cập dịch vụ của người dùng.
              </p>
            </div>
          </section>

          {/* Section 5: Liên kết bên thứ ba */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">5</span>
              Liên kết bên thứ ba
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nền tảng của chúng tôi có thể tích hợp hoặc chứa các liên kết dẫn đến các trang web hoặc dịch vụ từ bên thứ ba. Eleven hoàn toàn không chịu trách nhiệm pháp lý đối với nội dung thông tin hoặc các chính sách hoạt động của các đối tác này.
            </p>
          </section>

          {/* Section 6: Chấm dứt sử dụng */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">6</span>
              Tạm ngừng & Chấm dứt sử dụng
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chúng tôi bảo lưu toàn quyền tạm ngừng hoạt động hoặc chấm dứt quyền truy cập tài khoản của người dùng ngay lập tức mà không cần thông báo trước nếu phát hiện hành vi vi phạm nghiêm trọng các Điều khoản Dịch vụ này hoặc gây ảnh hưởng xấu đến hệ thống kỹ thuật và cộng đồng người dùng chung.
            </p>
          </section>

          {/* Section 7: Luật áp dụng */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">7</span>
              Luật áp dụng & Giải quyết tranh chấp
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Scale className="text-[#3c6c44] shrink-0 mt-0.5" size={16} />
              <p className="m-0">
                Các Điều khoản Dịch vụ này được điều chỉnh, giải thích và thực thi dựa trên quy định pháp luật hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp nếu phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng hòa giải.
              </p>
            </div>
          </section>

        </motion.div>

        {/* Footer Contact Info */}
        <div className="text-center mt-12 text-xs text-slate-400">
          <span>Nếu có câu hỏi về Điều khoản Dịch vụ, vui lòng liên hệ bộ phận hỗ trợ của Eleven qua trang </span>
          <a href="/danh-gia" className="text-[#3c6c44] font-bold hover:underline">Hỗ trợ & Góp ý</a>.
        </div>
        
      </div>
    </div>
  );
};

export default TermsPage;
