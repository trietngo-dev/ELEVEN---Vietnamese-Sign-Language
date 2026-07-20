import React from "react";
import { motion } from "framer-motion";
import { Shield, Database, UserCheck } from "lucide-react";

const PrivacyPage: React.FC = () => {
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
            <Shield size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Chính Sách Bảo Mật
          </h1>
          <p className="mt-3 text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
            Eleven cam kết bảo vệ quyền riêng tư và an toàn thông tin cá nhân của bạn khi sử dụng nền tảng.
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
              Eleven cam kết tuyệt đối trong việc bảo vệ quyền riêng tư và thông tin cá nhân của người dùng khi sử dụng các dịch vụ học tập trên nền tảng của chúng tôi.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mt-3">
              Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng Eleven, bạn đồng ý với các nội dung được quy định rõ trong Chính sách Bảo mật này.
            </p>
          </div>

          {/* Section 1: Thông tin chúng tôi thu thập */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">1</span>
              Thông tin chúng tôi thu thập
            </h2>
            <p className="text-slate-500 text-xs">
              Chúng tôi có thể thu thập và xử lý các loại thông tin cá nhân sau đây để cung cấp dịch vụ tốt hơn:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              {[
                { label: "Họ và tên", desc: "Để cá nhân hóa thông tin hiển thị trên tài khoản và chứng nhận học tập." },
                { label: "Địa chỉ email", desc: "Để xác thực tài khoản, gửi thông báo học tập quan trọng và hỗ trợ khôi phục mật khẩu." },
                { label: "Thông tin đăng nhập", desc: "Dữ liệu mật khẩu đã được mã hóa an toàn (salted hash) hoặc mã token đăng nhập Google." },
                { label: "Tiến độ học tập", desc: "Lịch sử xem bài học, danh sách từ đã lưu, và kết quả các bài kiểm tra nhận diện ký hiệu." },
                { label: "Dữ liệu tương tác", desc: "Cách bạn sử dụng các tính năng dịch AI, luyện tập qua camera, thời lượng học tập." },
                { label: "Thông tin thiết bị", desc: "Địa chỉ IP, loại trình duyệt, hệ điều hành được sử dụng để tối ưu hóa hiển thị." }
              ].map((item, idx) => (
                <li key={idx} className="p-3.5 bg-slate-50 rounded-xl hover:bg-[#3c6c44]/5 transition-all border border-slate-100 flex flex-col gap-1">
                  <span className="font-bold text-slate-800">{item.label}</span>
                  <span className="text-slate-500 leading-normal">{item.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2: Mục đích sử dụng thông tin */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">2</span>
              Mục đích sử dụng thông tin
            </h2>
            <p className="text-slate-500 text-xs">
              Mọi dữ liệu được thu thập chỉ phục vụ cho các mục đích hợp pháp sau đây:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
              {[
                "Cung cấp, duy trì và vận hành các tính năng cốt lõi của nền tảng.",
                "Cá nhân hóa lộ trình và đưa ra đề xuất học tập phù hợp nhất với bạn.",
                "Nâng cao độ chính xác của mô hình trí tuệ nhân tạo (AI) nhận diện VSL.",
                "Kịp thời phát hiện, xử lý các lỗi kỹ thuật và hỗ trợ chăm sóc học viên.",
                "Đảm bảo an ninh thông tin hệ thống, ngăn chặn các hành vi gian lận."
              ].map((text, idx) => (
                <div key={idx} className="flex gap-2 p-2.5 rounded-lg border border-slate-50 bg-[#3c6c44]/5 text-slate-700">
                  <div className="size-1.5 rounded-full bg-[#3c6c44] mt-1.5 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Dữ liệu học tập và AI */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">3</span>
              Dữ liệu học tập và AI
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Để liên tục cải thiện và tối ưu hóa các mô hình học máy (Machine Learning) nhận diện Ngôn ngữ Ký hiệu Việt Nam (VSL), Eleven có thể phân tích dữ liệu tương tác dưới dạng **tổng hợp và ẩn danh hoàn toàn**.
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/50 text-[#29613d] text-xs flex gap-2.5">
                <Database className="text-[#3c6c44] shrink-0 mt-0.5" size={15} />
                <span>
                  Chúng tôi cam kết tuyệt đối không bao giờ chia sẻ, bán hoặc sử dụng dữ liệu video cá nhân hoặc thông tin cá nhân của bạn cho các mục đích thương mại quảng cáo bên ngoài khi chưa được sự đồng ý rõ ràng từ bạn.
                </span>
              </div>
            </div>
          </section>

          {/* Section 4: Chia sẻ thông tin */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">4</span>
              Chia sẻ thông tin với bên thứ ba
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Eleven không bán, trao đổi hoặc cho thuê thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ dữ liệu trong các trường hợp cực kỳ hạn chế:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Khi có sự đồng ý trực tiếp hoặc yêu cầu từ chính người dùng.</li>
                <li>Thực hiện nghĩa vụ pháp lý bắt buộc theo yêu cầu bằng văn bản của cơ quan nhà nước có thẩm quyền.</li>
                <li>Để bảo vệ quyền và lợi ích hợp pháp của Eleven cùng cộng đồng học viên trong các tình huống khẩn cấp.</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Cookie và công nghệ tương tự */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">5</span>
              Cookie và công nghệ theo dõi
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chúng tôi sử dụng cookie để lưu phiên đăng nhập của bạn, ghi nhớ tùy chọn cá nhân và phân tích hiệu suất tải trang của hệ thống. Bạn hoàn toàn có thể lựa chọn điều chỉnh hoặc tắt cookie bất cứ lúc nào thông qua phần cài đặt của trình duyệt web cá nhân.
            </p>
          </section>

          {/* Section 6: Bảo mật thông tin */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">6</span>
              An toàn & Bảo mật thông tin
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chúng tôi áp dụng các chuẩn mã hóa SSL/TLS hiện đại cùng các biện pháp quản lý nội bộ chặt chẽ để bảo vệ thông tin của bạn trước các nguy cơ truy cập trái phép, tiết lộ hoặc thay đổi dữ liệu ngoài ý muốn. Tuy nhiên, xin lưu ý rằng không có phương thức truyền tải internet hoặc lưu trữ số nào có khả năng an toàn tuyệt đối 100%.
            </p>
          </section>

          {/* Section 7: Quyền của người dùng */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">7</span>
              Quyền hạn của bạn đối với dữ liệu
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Với tư cách là người dùng của Eleven, bạn có đầy đủ các quyền theo quy định của Luật An ninh mạng và các văn bản quy phạm pháp luật liên quan tại Việt Nam:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  "Truy cập và xem thông tin hồ sơ cá nhân của mình.",
                  "Yêu cầu cập nhật, chỉnh sửa thông tin chưa chính xác.",
                  "Yêu cầu xóa tài khoản và toàn bộ dữ liệu cá nhân liên quan.",
                  "Yêu cầu ngừng xử lý hoặc hạn chế xử lý dữ liệu cá nhân."
                ].map((txt, idx) => (
                  <div key={idx} className="flex gap-2 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <UserCheck className="text-[#3c6c44] shrink-0" size={15} />
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 8: Thay đổi chính sách */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3c6c44]/10 text-[#3c6c44] text-sm font-black">8</span>
              Thay đổi nội dung Chính sách
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eleven có thể cập nhật Chính sách Bảo mật này theo thời gian để phù hợp với sự thay đổi của công nghệ hoặc quy định pháp lý mới. Mọi phiên bản cập nhật đều sẽ được ghi nhận thời gian chỉnh sửa và đăng tải công khai trên ứng dụng/website của chúng tôi.
            </p>
          </section>

        </motion.div>

        {/* Footer Contact Info */}
        <div className="text-center mt-12 text-xs text-slate-400">
          <span>Nếu có bất kỳ thắc mắc nào liên quan đến bảo mật dữ liệu, vui lòng gửi email đến bộ phận an toàn thông tin của Eleven qua trang </span>
          <a href="/danh-gia" className="text-[#3c6c44] font-bold hover:underline">Hỗ trợ & Góp ý</a>.
        </div>
        
      </div>
    </div>
  );
};

export default PrivacyPage;
