export const viText = {
  common: {
    brandName: "Eleven",
    buttons: {
      start: "Bắt đầu",
      signIn: "Đăng nhập",
      tryTranslator: "Thử trình dịch",
      startLearning: "Bắt đầu học",
      createFreeAccount: "Tạo tài khoản miễn phí",
    },
  },
  navbar: {
    brandAriaLabel: "Eleven Home",
    navAriaLabel: "Điều hướng chính",
    items: [
      { label: "Trang chủ", to: "/" },
      { label: "Khóa học", to: "/khoa-hoc" },
      { label: "Từ điển", to: "/tu-dien" },
      { label: "Đánh giá", to: "/danh-gia" },
    ],
  },
  footer: {
    copy: "© 2026 Eleven.",
    navAriaLabel: "Liên kết chân trang",
    links: [
      { label: "Chính sách bảo mật", href: "#" },
      { label: "Điều khoản dịch vụ", href: "#" },
      { label: "Chính sách Cookie", href: "#" },
    ],
  },
  landing: {
    hero: {
      badge: "MỚI! THỬ NGHIỆM DỊCH THUẬT THỜI GIAN THỰC",
      title: "Làm chủ Ngôn ngữ Ký hiệu dễ dàng với",
      titleHighlight: "Độ chính xác từ AI",
      description:
        "Trải nghiệm giao tiếp liền mạch với trình dịch AI cho ngôn ngữ ký hiệu Việt. Học theo tốc độ của riêng bạn với các mô-đun tương tác dành cho mọi người.",
      imageAlt: "Minh họa phiên dịch ngôn ngữ ký hiệu",
      realtimeCaption:
        'DỊCH THUẬT THỜI GIAN THỰC: "Xin chào, tôi có thể giúp gì cho bạn hôm nay?"',
    },
    sections: {
      featureTitle: "Sẵn sàng phá vỡ rào cản giao tiếp?",
      learningTitle: "Bạn sẽ học được gì",
    },
    featureCards: [
      {
        title: "Dịch AI thời gian thực",
        body: "Công nghệ AI tối ưu giúp dịch các cử chỉ thành văn bản hoặc lời nói ngay lập tức với độ chính xác cao.",
      },
      {
        title: "Bài học tương tác",
        body: "Lộ trình học trực quan theo chủ đề và phản hồi động tác ngay trong lúc luyện tập cùng video minh họa.",
      },
      {
        title: "Chuyển văn bản thành giọng nói",
        body: "Tăng khả năng giao tiếp bằng TTS để bạn tự tin hơn trong mọi tình huống hàng ngày.",
      },
    ],
    learningPoints: [
      {
        title: "Nền tảng cơ bản",
        body: "Bắt đầu từ các bộ chữ cái, chủ đề và ký hiệu thông dụng nhất cho người mới.",
      },
      {
        title: "Giao tiếp hàng ngày",
        body: "Học các mẫu câu tự nhiên dùng trong lớp học, gia đình và môi trường công việc.",
      },
      {
        title: "Ngữ pháp nâng cao",
        body: "Nắm cách biểu cảm khuôn mặt, vị trí tay và ngữ cảnh để ký hiệu chuẩn hơn.",
      },
      {
        title: "Bối cảnh văn hóa",
        body: "Hiểu thêm về cộng đồng người khiếm thính và cách ứng xử khi giao tiếp thực tế.",
      },
    ],
    cta: {
      title: "Sẵn sàng phá vỡ rào cản giao tiếp?",
      description:
        "Tham gia cùng hơn 50.000 người dùng đang sử dụng ElevenAI để kết nối với cộng đồng, gia đình và đồng nghiệp quốc tế.",
    },
  },
  placeholderPages: {
    courses: {
      title: "Khóa học",
      subtitle:
        "Trang khóa học sẽ được kết nối dữ liệu Supabase ở bước tiếp theo.",
    },
    dictionary: {
      title: "Từ điển",
      subtitle:
        "Khu vực từ điển ký hiệu sẽ hiển thị sau khi tích hợp API tra cứu.",
    },
    review: {
      title: "Đánh giá",
      subtitle:
        "Module đánh giá động tác bằng AI sẽ được thêm ở phase tiếp theo.",
    },
    signIn: {
      title: "Đăng nhập",
      subtitle:
        "Trang form đăng nhập và đăng ký sẽ được xây bằng React Hook Form + Zod.",
    },
  },
} as const;
