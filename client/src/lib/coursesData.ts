import xinChaoVideo from "../assets/videoCourse/W00489.mp4";

export interface Course {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  summary: string;
  description: string;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao";
  coverMediaId: number;
  isPremium: boolean;
  status: number | string;
}

export interface Module {
  id: number;
  courseId: number;
  title: string;
  sortOrder: number;
  isPreview?: boolean;
}

export interface Lesson {
  id: number;
  courseId: number;
  moduleId: number;
  title: string;
  videoUrl: string;
  estimatedMinutes: number;
  sortOrder: number;
  difficultyLevel: "Cơ bản" | "Trung cấp" | "Nâng cao";
  shortDescription: string;
  objectiveText?: string;
  xpReward: number;
}

export const mockCourses: Course[] = [
  {
    id: 6,
    categoryId: 6,
    title: "Giao tiếp chào hỏi",
    slug: "giao-tiep-chao-hoi",
    summary: "Học cách chào hỏi, cảm ơn và xưng hô giao tiếp ban đầu.",
    description: "Khóa học này giới thiệu các ký hiệu cơ bản nhất để giao tiếp và chào hỏi người khiếm thính.",
    level: "Cơ bản",
    coverMediaId: 38,
    isPremium: false,
    status: 1
  },
  {
    id: 101,
    categoryId: 6,
    title: "Chữ cái & Số đếm",
    slug: "chu-cai-va-so-dem",
    summary: "Bảng chữ cái VSL và chữ số cơ bản.",
    description: "Học cách đánh vần tên của bạn và đếm số từ 1 đến 10 bằng ngôn ngữ ký hiệu Việt Nam.",
    level: "Cơ bản",
    coverMediaId: 39,
    isPremium: false,
    status: 1
  },
  {
    id: 102,
    categoryId: 6,
    title: "Địa lý & Hành chính",
    slug: "dia-ly-va-hanh-chinh",
    summary: "Cách hỏi địa chỉ, chỉ đường và các vùng miền.",
    description: "Nhận biết các ký hiệu chỉ hành chính (tỉnh, thành phố, địa chỉ) và địa danh lớn tại Việt Nam.",
    level: "Trung cấp",
    coverMediaId: 40,
    isPremium: true,
    status: 1
  },
  {
    id: 103,
    categoryId: 6,
    title: "Cảm xúc & Thói quen",
    slug: "cam-xuc-va-thoi-quen",
    summary: "Cách biểu lộ tâm trạng và thói quen sinh hoạt hằng ngày.",
    description: "Các bài học diễn tả cảm xúc ghen tị, bực mình và mô tả thói quen sinh hoạt hằng ngày.",
    level: "Trung cấp",
    coverMediaId: 41,
    isPremium: true,
    status: 1
  },
  {
    id: 104,
    categoryId: 6,
    title: "Các ngày lễ lớn",
    slug: "cac-ngay-le-lon",
    summary: "Ký hiệu về các ngày lễ Tết truyền thống và quốc tế.",
    description: "Diễn tả Tết Hàn Thực, giỗ tổ Hùng Vương, ngày Quốc tế phụ nữ 8/3 và các dịp lễ lớn trong năm.",
    level: "Nâng cao",
    coverMediaId: 42,
    isPremium: true,
    status: 1
  },
  {
    id: 105,
    categoryId: 6,
    title: "Kinh tế & Thương mại",
    slug: "kinh-te-va-thuong-mai",
    summary: "Các từ vựng chuyên ngành kinh tế và giao dịch.",
    description: "Bài học về từ vựng nâng cao: nhập khẩu, xuất khẩu, hấp dẫn, thị trường,...",
    level: "Nâng cao",
    coverMediaId: 43,
    isPremium: true,
    status: 1
  }
];

export const mockModules: Module[] = [
  // Course 6
  { id: 1001, courseId: 6, title: "Chương 1: Chào hỏi & Làm quen", sortOrder: 1, isPreview: true },
  { id: 1002, courseId: 6, title: "Chương 2: Từ vựng gia đình", sortOrder: 2, isPreview: true },

  // Course 101
  { id: 1003, courseId: 101, title: "Chương 1: Bảng chữ cái", sortOrder: 1, isPreview: true },
  { id: 1004, courseId: 101, title: "Chương 2: Chữ số cơ bản", sortOrder: 2, isPreview: true },

  // Course 102
  { id: 1005, courseId: 102, title: "Chương 1: Địa chỉ cư trú", sortOrder: 1, isPreview: true },
  { id: 1006, courseId: 102, title: "Chương 2: Vùng miền & Đô thị", sortOrder: 2, isPreview: false },

  // Course 103
  { id: 1007, courseId: 103, title: "Chương 1: Trạng thái cảm xúc", sortOrder: 1, isPreview: true },
  { id: 1008, courseId: 103, title: "Chương 2: Thói quen sinh hoạt", sortOrder: 2, isPreview: false },

  // Course 104
  { id: 1009, courseId: 104, title: "Chương 1: Lễ hội truyền thống", sortOrder: 1, isPreview: true },
  { id: 1010, courseId: 104, title: "Chương 2: Sự kiện xã hội", sortOrder: 2, isPreview: false },

  // Course 105
  { id: 1011, courseId: 105, title: "Chương 1: Ngoại thương & Giao dịch", sortOrder: 1, isPreview: true }
];

export const mockLessons: Lesson[] = [
  // Course 6 - Chương 1
  {
    id: 2001,
    courseId: 6,
    moduleId: 1001,
    title: "Chào hỏi",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 1,
    difficultyLevel: "Cơ bản",
    shortDescription: "Cách chào hỏi ban đầu khi gặp người khiếm thính.",
    objectiveText: "Chào hỏi lịch sự và cởi mở.",
    xpReward: 50
  },
  {
    id: 2002,
    courseId: 6,
    moduleId: 1001,
    title: "Cảm ơn",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 2,
    difficultyLevel: "Cơ bản",
    shortDescription: "Ký hiệu biểu lộ lòng biết ơn chân thành.",
    objectiveText: "Thể hiện lời cảm ơn bằng cử chỉ.",
    xpReward: 50
  },
  {
    id: 2003,
    courseId: 6,
    moduleId: 1001,
    title: "Tạm biệt",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 3,
    difficultyLevel: "Cơ bản",
    shortDescription: "Chào tạm biệt và hẹn gặp lại.",
    objectiveText: "Kết thúc hội thoại thân thiện.",
    xpReward: 50
  },
  // Course 6 - Chương 2
  {
    id: 2004,
    courseId: 6,
    moduleId: 1002,
    title: "Mẹ",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 1,
    difficultyLevel: "Cơ bản",
    shortDescription: "Từ vựng xưng hô kính trọng dành cho mẹ.",
    objectiveText: "Ký hiệu biểu thị về người mẹ.",
    xpReward: 50
  },
  {
    id: 2005,
    courseId: 6,
    moduleId: 1002,
    title: "Cha",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 2,
    difficultyLevel: "Cơ bản",
    shortDescription: "Từ vựng xưng hô tôn kính dành cho cha.",
    objectiveText: "Ký hiệu biểu thị về người cha.",
    xpReward: 50
  },

  // Course 101 - Chương 1
  {
    id: 2006,
    courseId: 101,
    moduleId: 1003,
    title: "Chữ cái A",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 4,
    sortOrder: 1,
    difficultyLevel: "Cơ bản",
    shortDescription: "Chữ cái đầu tiên trong bảng chữ cái VSL.",
    xpReward: 40
  },
  {
    id: 2007,
    courseId: 101,
    moduleId: 1003,
    title: "Chữ cái B",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 4,
    sortOrder: 2,
    difficultyLevel: "Cơ bản",
    shortDescription: "Cách đánh vần chữ cái B.",
    xpReward: 40
  },
  // Course 101 - Chương 2
  {
    id: 2008,
    courseId: 101,
    moduleId: 1004,
    title: "Số 1",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 4,
    sortOrder: 1,
    difficultyLevel: "Cơ bản",
    shortDescription: "Biểu diễn số đếm 1 bằng ngón tay.",
    xpReward: 40
  },
  {
    id: 2009,
    courseId: 101,
    moduleId: 1004,
    title: "Số 2",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 4,
    sortOrder: 2,
    difficultyLevel: "Cơ bản",
    shortDescription: "Biểu diễn số đếm 2 bằng ngón tay.",
    xpReward: 40
  },

  // Course 102 - Chương 1
  {
    id: 2010,
    courseId: 102,
    moduleId: 1005,
    title: "Địa chỉ",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 6,
    sortOrder: 1,
    difficultyLevel: "Trung cấp",
    shortDescription: "Ký hiệu dùng để hỏi hoặc cung cấp địa chỉ nhà ở.",
    xpReward: 60
  },
  {
    id: 2011,
    courseId: 102,
    moduleId: 1005,
    title: "Tỉnh",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 6,
    sortOrder: 2,
    difficultyLevel: "Trung cấp",
    shortDescription: "Ký hiệu biểu thị đơn vị hành chính tỉnh.",
    xpReward: 60
  },
  // Course 102 - Chương 2
  {
    id: 2012,
    courseId: 102,
    moduleId: 1006,
    title: "Đồng bằng",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 6,
    sortOrder: 1,
    difficultyLevel: "Trung cấp",
    shortDescription: "Từ vựng chỉ địa lý đồng bằng sông Cửu Long / sông Hồng.",
    xpReward: 60
  },
  {
    id: 2013,
    courseId: 102,
    moduleId: 1006,
    title: "Phương Đông",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 6,
    sortOrder: 2,
    difficultyLevel: "Trung cấp",
    shortDescription: "Chỉ hướng Đông hoặc phương Đông.",
    xpReward: 60
  },

  // Course 103 - Chương 1
  {
    id: 2014,
    courseId: 103,
    moduleId: 1007,
    title: "Ghen tị",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 1,
    difficultyLevel: "Trung cấp",
    shortDescription: "Biểu lộ sắc thái cảm xúc ghen tị.",
    xpReward: 50
  },
  {
    id: 2015,
    courseId: 103,
    moduleId: 1007,
    title: "Bực mình",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 2,
    difficultyLevel: "Trung cấp",
    shortDescription: "Biểu lộ sắc thái khó chịu, bực bội.",
    xpReward: 50
  },
  // Course 103 - Chương 2
  {
    id: 2016,
    courseId: 103,
    moduleId: 1008,
    title: "Thói quen",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 1,
    difficultyLevel: "Trung cấp",
    shortDescription: "Diễn tả hành vi lặp lại tạo thành thói quen.",
    xpReward: 50
  },
  {
    id: 2017,
    courseId: 103,
    moduleId: 1008,
    title: "Khuyến khích",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 5,
    sortOrder: 2,
    difficultyLevel: "Trung cấp",
    shortDescription: "Động viên, cổ vũ người khác cố gắng.",
    xpReward: 50
  },

  // Course 104 - Chương 1
  {
    id: 2018,
    courseId: 104,
    moduleId: 1009,
    title: "Tết hàn thực",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 7,
    sortOrder: 1,
    difficultyLevel: "Nâng cao",
    shortDescription: "Ngày lễ truyền thống ăn bánh trôi bánh chay mùng 3 tháng 3 âm lịch.",
    xpReward: 70
  },
  {
    id: 2019,
    courseId: 104,
    moduleId: 1009,
    title: "Giỗ tổ Hùng Vương",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 7,
    sortOrder: 2,
    difficultyLevel: "Nâng cao",
    shortDescription: "Lễ hội tưởng nhớ công ơn các vua Hùng mùng 10 tháng 3 âm lịch.",
    xpReward: 70
  },
  // Course 104 - Chương 2
  {
    id: 2020,
    courseId: 104,
    moduleId: 1010,
    title: "Ngày Quốc tế phụ nữ 8/3",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 7,
    sortOrder: 1,
    difficultyLevel: "Nâng cao",
    shortDescription: "Dịp kỷ niệm chúc mừng nữ giới toàn cầu.",
    xpReward: 70
  },
  {
    id: 2021,
    courseId: 104,
    moduleId: 1010,
    title: "Tuần lễ người Điếc thế giới",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 7,
    sortOrder: 2,
    difficultyLevel: "Nâng cao",
    shortDescription: "Sự kiện nâng cao ý thức xã hội về cộng đồng khiếm thính.",
    xpReward: 70
  },

  // Course 105 - Chương 1
  {
    id: 2022,
    courseId: 105,
    moduleId: 1011,
    title: "Nhập khẩu",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 8,
    sortOrder: 1,
    difficultyLevel: "Nâng cao",
    shortDescription: "Từ vựng chuyên môn về hoạt động mua hàng hóa từ nước ngoài.",
    xpReward: 80
  },
  {
    id: 2023,
    courseId: 105,
    moduleId: 1011,
    title: "Hấp dẫn",
    videoUrl: xinChaoVideo,
    estimatedMinutes: 6,
    sortOrder: 2,
    difficultyLevel: "Nâng cao",
    shortDescription: "Lôi cuốn, có sức hút mạnh mẽ.",
    xpReward: 60
  }
];
