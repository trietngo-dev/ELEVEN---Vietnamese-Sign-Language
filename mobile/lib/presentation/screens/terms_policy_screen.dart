import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TermsPolicyScreen extends StatelessWidget {
  final bool isTerms;

  const TermsPolicyScreen({super.key, required this.isTerms});

  @override
  Widget build(BuildContext context) {
    final title = isTerms ? "Điều Khoản Dịch Vụ" : "Chính Sách Bảo Mật";
    const primaryGreen = Color(0xFF29613D);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FDF8),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: primaryGreen),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          title,
          style: GoogleFonts.quicksand(
            fontWeight: FontWeight.bold,
            color: primaryGreen,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: primaryGreen.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isTerms ? Icons.file_present_rounded : Icons.shield_outlined,
                    color: primaryGreen,
                    size: 36,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Center(
                child: Text(
                  title,
                  style: GoogleFonts.quicksand(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E293B),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  isTerms
                      ? "Điều khoản điều chỉnh việc sử dụng nền tảng Eleven của bạn."
                      : "Cam kết bảo mật dữ liệu và thông tin cá nhân của người học.",
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              isTerms ? _buildTermsContent() : _buildPrivacyContent(),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTermsContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader("Giới thiệu chung"),
        _buildSectionBody(
          "Các Điều khoản Dịch vụ này điều chỉnh việc bạn sử dụng nền tảng Eleven, bao gồm website, ứng dụng di động và các dịch vụ liên quan do Eleven cung cấp.\n\n"
          "Bằng việc truy cập hoặc sử dụng Eleven, bạn đồng ý tuân thủ các Điều khoản Dịch vụ này và các quy định pháp luật hiện hành. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng nền tảng.",
        ),
        _buildSectionHeader("1. Giới hạn sử dụng"),
        _buildSectionBody(
          "Khi sử dụng Eleven, bạn đồng ý KHÔNG thực hiện các hành vi sau:\n"
          "• Sao chép, chỉnh sửa, phân phối hoặc khai thác trái phép nội dung thuộc nền tảng.\n"
          "• Can thiệp, làm gián đoạn hoặc gây ảnh hưởng đến hoạt động của hệ thống.\n"
          "• Sử dụng dịch vụ cho các hoạt động vi phạm pháp luật hiện hành.\n"
          "• Phát tán nội dung mang tính xúc phạm, quấy rối, lừa đảo hoặc gây hại cho người khác.\n"
          "• Thu thập dữ liệu cá nhân của người dùng khác khi chưa được phép.\n"
          "• Ảnh hưởng xấu đến quyền riêng tư hoặc sở hữu trí tuệ của bên thứ ba.",
        ),
        _buildSectionHeader("2. Quyền sở hữu trí tuệ"),
        _buildSectionBody(
          "Toàn bộ nội dung trên Eleven bao gồm bài học, video, hình ảnh, thiết kế giao diện, dữ liệu, phần mềm và các tài liệu liên quan đều thuộc quyền sở hữu của Eleven hoặc các đối tác được cấp phép.\n\n"
          "Người dùng chỉ được sử dụng nội dung cho mục đích học tập và sử dụng cá nhân, không nhằm mục đích thương mại.",
        ),
        _buildSectionHeader("3. Dịch vụ AI (Trí tuệ nhân tạo)"),
        _buildSectionBody(
          "Một số tính năng của Eleven sử dụng trí tuệ nhân tạo (AI) để hỗ trợ học Ngôn ngữ Ký hiệu Việt Nam (VSL), nhận diện ký hiệu qua camera và dịch thuật giao tiếp.\n\n"
          "Các kết quả do AI cung cấp chỉ mang tính tham khảo hỗ trợ và có thể không chính xác tuyệt đối trong mọi trường hợp ngữ cảnh thực tế.",
        ),
        _buildSectionHeader("4. Trách nhiệm pháp lý"),
        _buildSectionBody(
          "Eleven được cung cấp trên cơ sở \"nguyên trạng\". Chúng tôi không đảm bảo rằng dịch vụ sẽ luôn không bị gián đoạn, không có lỗi hoặc phù hợp với mọi mục đích sử dụng cụ thể của bạn.\n\n"
          "Trong phạm vi pháp luật cho phép, Eleven sẽ không chịu trách nhiệm đối với bất kỳ tổn thất trực tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.",
        ),
        _buildSectionHeader("5. Liên kết bên thứ ba"),
        _buildSectionBody(
          "Nền tảng có thể chứa liên kết đến các website hoặc dịch vụ của bên thứ ba. Eleven không chịu trách nhiệm đối với nội dung hoặc chính sách của các bên này.",
        ),
        _buildSectionHeader("6. Chấm dứt sử dụng"),
        _buildSectionBody(
          "Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của người dùng nếu phát hiện hành vi vi phạm Điều khoản Dịch vụ hoặc gây ảnh hưởng đến hệ thống và cộng đồng người dùng.",
        ),
        _buildSectionHeader("7. Luật áp dụng"),
        _buildSectionBody(
          "Các Điều khoản Dịch vụ này được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp nếu có sẽ được ưu tiên giải quyết thông qua thương lượng hòa giải.",
        ),
      ],
    );
  }

  Widget _buildPrivacyContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader("Giới thiệu"),
        _buildSectionBody(
          "Eleven cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng khi sử dụng nền tảng.\n\n"
          "Bằng việc truy cập hoặc sử dụng Eleven, bạn đồng ý với các nội dung được quy định trong Chính sách Bảo mật này.",
        ),
        _buildSectionHeader("1. Thông tin chúng tôi thu thập"),
        _buildSectionBody(
          "Chúng tôi có thể thu thập các thông tin sau:\n"
          "• Họ và tên\n"
          "• Địa chỉ email\n"
          "• Thông tin đăng nhập tài khoản\n"
          "• Tiến độ học tập và lịch sử sử dụng\n"
          "• Dữ liệu tương tác với các tính năng trên nền tảng\n"
          "• Thông tin thiết bị và trình duyệt",
        ),
        _buildSectionHeader("2. Mục đích sử dụng thông tin"),
        _buildSectionBody(
          "Thông tin được thu thập nhằm:\n"
          "• Cung cấp và duy trì dịch vụ ổn định.\n"
          "• Cá nhân hóa trải nghiệm học tập của bạn.\n"
          "• Cải thiện chất lượng nội dung và các tính năng AI nhận diện.\n"
          "• Hỗ trợ kỹ thuật và chăm sóc người học.\n"
          "• Đảm bảo an toàn và bảo mật hệ thống.",
        ),
        _buildSectionHeader("3. Dữ liệu học tập và AI"),
        _buildSectionBody(
          "Để cải thiện chất lượng dịch vụ, Eleven có thể sử dụng dữ liệu học tập và dữ liệu tương tác dưới dạng tổng hợp và ẩn danh nhằm nghiên cứu, phát triển và tối ưu hóa các tính năng AI.\n\n"
          "Chúng tôi cam kết không sử dụng dữ liệu cá nhân của người dùng cho mục đích thương mại khi chưa có sự đồng ý.",
        ),
        _buildSectionHeader("4. Chia sẻ thông tin"),
        _buildSectionBody(
          "Eleven không bán, trao đổi hoặc cho thuê thông tin cá nhân của người dùng cho bên thứ ba.\n\n"
          "Thông tin chỉ có thể được chia sẻ trong các trường hợp:\n"
          "• Có sự đồng ý rõ ràng từ bạn.\n"
          "• Thực hiện nghĩa vụ pháp lý theo yêu cầu của cơ quan có thẩm quyền.\n"
          "• Bảo vệ quyền lợi hợp pháp của Eleven và cộng đồng người dùng.",
        ),
        _buildSectionHeader("5. Cookie và công nghệ tương tự"),
        _buildSectionBody(
          "Eleven có thể sử dụng cookie hoặc các công nghệ tương tự để: ghi nhớ đăng nhập, lưu tùy chọn cá nhân, phân tích hiệu suất hệ thống và nâng cao trải nghiệm sử dụng.",
        ),
        _buildSectionHeader("6. Bảo mật thông tin"),
        _buildSectionBody(
          "Chúng tôi áp dụng các biện pháp kỹ thuật và quản lý phù hợp nhằm bảo vệ dữ liệu khỏi truy cập trái phép, mất mát hoặc tiết lộ ngoài ý muốn. Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ dữ liệu nào đảm bảo an toàn tuyệt đối.",
        ),
        _buildSectionHeader("7. Quyền của người dùng"),
        _buildSectionBody(
          "Người dùng có quyền truy cập thông tin cá nhân của mình, yêu cầu cập nhật hoặc chỉnh sửa thông tin, yêu cầu xóa tài khoản hoặc yêu cầu ngừng xử lý dữ liệu cá nhân theo quy định pháp luật.",
        ),
        _buildSectionHeader("8. Thay đổi chính sách"),
        _buildSectionBody(
          "Eleven có thể cập nhật Chính sách Bảo mật theo thời gian để phù hợp với hoạt động của nền tảng và quy định pháp luật hiện hành. Các thay đổi sẽ được thông báo trên website hoặc ứng dụng.",
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 18.0, bottom: 8.0),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Color(0xFF1E293B),
        ),
      ),
    );
  }

  Widget _buildSectionBody(String content) {
    return Text(
      content,
      style: const TextStyle(
        fontSize: 12,
        color: Color(0xFF475569),
        height: 1.5,
      ),
    );
  }
}
