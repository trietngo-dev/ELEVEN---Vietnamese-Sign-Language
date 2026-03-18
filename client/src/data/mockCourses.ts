export type CourseCategory =
  | "all"
  | "co-ban"
  | "cong-so"
  | "giao-tiep"
  | "y-te";

export type CourseItem = {
  id: string;
  title: string;
  description: string;
  category: Exclude<CourseCategory, "all">;
  levelLabel: string;
  lessonCount: number;
  teacherName: string;
  isNewest?: boolean;
  thumbnail: {
    bgClass: string;
    glowClass: string;
  };
};

export const courseCategories: Array<{
  id: CourseCategory;
  label: string;
}> = [
  { id: "all", label: "Tất cả" },
  { id: "co-ban", label: "Cơ bản" },
  { id: "cong-so", label: "Công sở" },
  { id: "giao-tiep", label: "Giao tiếp" },
  { id: "y-te", label: "Y tế" },
];

// Mock data for UI preview. Replace this list with API response when backend is ready.
export const mockCourses: CourseItem[] = [
  {
    id: "cb-101",
    title: "Ký năng cơ bản 101",
    description:
      "Làm quen với bảng chữ cái và các cấu trúc câu đơn giản nhất trong ngôn ngữ ký hiệu.",
    category: "co-ban",
    levelLabel: "Cơ bản",
    lessonCount: 12,
    teacherName: "Giảng viên Mai",
    isNewest: true,
    thumbnail: {
      bgClass:
        "bg-[radial-gradient(circle_at_24%_26%,#ddf5eb_0%,#b4e0cf_36%,#78b69f_100%)]",
      glowClass: "bg-[#2e7a4a]/20",
    },
  },
  {
    id: "cs-205",
    title: "Tiếng ký hiệu Công sở",
    description:
      "Giao tiếp tự tin trong các cuộc họp và trao đổi với đồng nghiệp khiếm thính.",
    category: "cong-so",
    levelLabel: "Công sở",
    lessonCount: 15,
    teacherName: "Giảng viên Khang",
    thumbnail: {
      bgClass:
        "bg-[radial-gradient(circle_at_78%_18%,#e4f1ff_0%,#abc6e6_34%,#6f90be_100%)]",
      glowClass: "bg-[#3b6b8f]/20",
    },
  },
  {
    id: "yt-111",
    title: "Thuật ngữ Y tế Cơ bản",
    description:
      "Học cách trao đổi về tình trạng sức khỏe và triệu chứng bệnh cơ bản với bệnh nhân.",
    category: "y-te",
    levelLabel: "Y tế",
    lessonCount: 20,
    teacherName: "Giảng viên Thanh",
    thumbnail: {
      bgClass:
        "bg-[radial-gradient(circle_at_78%_12%,#fff4ef_0%,#ffd4c4_38%,#f3ac8d_100%)]",
      glowClass: "bg-[#a65a3d]/20",
    },
  },
  {
    id: "gt-302",
    title: "Giao tiếp Xã hội",
    description:
      "Các chủ đề hàng ngày như gọi món, hỏi đường và kết bạn mới trong ngữ cảnh thực tế.",
    category: "giao-tiep",
    levelLabel: "Giao tiếp",
    lessonCount: 10,
    teacherName: "Giảng viên Thư",
    thumbnail: {
      bgClass:
        "bg-[radial-gradient(circle_at_30%_24%,#ecffdd_0%,#cde8a7_42%,#93b869_100%)]",
      glowClass: "bg-[#5f7f2f]/20",
    },
  },
];
