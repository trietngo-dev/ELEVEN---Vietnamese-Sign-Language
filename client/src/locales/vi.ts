export const viText = {
  common: {
    brandName: "Eleven",
    buttons: {
      start: "Bắt đầu",
      signIn: "Đăng nhập",
      tryTranslator: "Thử trình dịch",
      startLearning: "Bắt đầu học",
      viewDetail: "Xem chi tiết",
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
      { label: "Hỗ trợ", to: "/danh-gia" },
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

  //==============================================================================================================================
  coursesPage: {
    upgrade: {
      title: "Nâng cấp tài khoản Pro ngay!",
      description:
        "Mở khóa toàn bộ thư viện bài học chuyên sâu về y tế và kỹ thuật.",
      cta: "Nâng cấp ngay",
    },
    hero: {
      title: "Khám phá khóa học",
      description:
        "Bắt đầu hành trình giao tiếp không giới hạn. Tìm kiếm lộ trình học phù hợp với mục tiêu cá nhân hoặc công việc của bạn.",
    },
    labels: {
      newest: "Mới nhất",
      lessons: "bài học",
      empty:
        "Chưa có khóa học trong nhóm này. Dữ liệu sẽ được lấy từ API ở bước tiếp theo.",
    },
  },

  dictionaryPage: {
    hero: {
      title: "Từ điển ngôn ngữ ký hiệu",
      description:
        "Tìm kiếm và học các ký hiệu phổ biến nhất thông qua hệ thống video minh họa sinh động.",
    },
    search: {
      placeholder: "Tìm kiếm từ vựng...",
      button: "Tìm kiếm",
    },
    pagination: {
      previousAriaLabel: "Trang trước",
      nextAriaLabel: "Trang sau",
    },
    labels: {
      empty: "Chưa có dữ liệu từ điển phù hợp với bộ lọc hiện tại.",
    },
  },

  reviewPage: {
    hero: {
      title: "Trung tâm hỗ trợ",
      description:
        "Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy gửi yêu cầu và đội ngũ Eleven sẽ phản hồi trong thời gian sớm nhất.",
    },
    rating: {
      prompt: "Mức độ cấp thiết?",
      veryBad: "Rất gấp",
      notGood: "Gấp",
      normal: "Bình thường",
      satisfied: "Không vội",
      verySatisfied: "Tham khảo",
    },
    form: {
      categoryLabel: "Loại yêu cầu hỗ trợ",
      categoryPlaceholder: "Chọn loại yêu cầu...",
      detailLabel: "Mô tả chi tiết vấn đề",
      detailPlaceholder:
        "Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải để chúng tôi hỗ trợ nhanh hơn...",
      submitButton: "Gửi yêu cầu hỗ trợ",
    },
  },

  authPages: {
    backButton: "Quay lại",
    socialDivider: "Hoặc tiếp tục với",
    providers: {
      google: "Google",
      apple: "Apple",
    },
    login: {
      title: "Chào mừng trở lại",
      subtitle: "Vui lòng nhập thông tin để đăng nhập.",
      emailLabel: "Địa chỉ Email",
      emailPlaceholder: "ten@congty.com",
      passwordLabel: "Mật khẩu",
      passwordPlaceholder: "********",
      forgotPassword: "Quên mật khẩu?",
      submitButton: "Đăng nhập",
      noAccount: "Chưa có tài khoản?",
      registerNow: "Đăng ký ngay",
    },
    register: {
      title: "Tạo tài khoản của bạn",
      subtitle: "Tham gia cộng đồng học ngôn ngữ ký hiệu.",
      nameLabel: "Họ và tên",
      namePlaceholder: "Nhập họ và tên của bạn",
      emailLabel: "Địa chỉ Email",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Mật khẩu",
      passwordPlaceholder: "tối thiểu 8 ký tự",
      confirmPasswordLabel: "Xác nhận mật khẩu",
      confirmPasswordPlaceholder: "Nhập lại mật khẩu",
      submitButton: "Tạo tài khoản",
      hasAccount: "Đã có tài khoản?",
      signInNow: "Đăng nhập",
      agreementText:
        "Bằng cách đăng ký, tôi đồng ý với các điều khoản của Eleven.",
      termLink: "Điều khoản dịch vụ",
      privacyLink: "Chính sách bảo mật",
      showPasswordAria: "Hiện mật khẩu",
      hidePasswordAria: "Ẩn mật khẩu",
    },
  },

  //==============================================================================================================================
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
