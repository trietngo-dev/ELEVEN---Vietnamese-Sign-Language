export type DictionaryCategory =
  | "all"
  | "chao-hoi"
  | "gia-dinh"
  | "cong-viec"
  | "y-te"
  | "du-lich";

export type DictionaryEntry = {
  id: string;
  word: string;
  category: Exclude<DictionaryCategory, "all">;
  viewsLabel: string;
  imageLabel: string;
  imageClass: string;
};

export const alphabetList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const dictionaryCategories: Array<{
  id: DictionaryCategory;
  label: string;
}> = [
  { id: "all", label: "Tất cả" },
  { id: "chao-hoi", label: "Chào hỏi" },
  { id: "gia-dinh", label: "Gia đình" },
  { id: "cong-viec", label: "Công việc" },
  { id: "y-te", label: "Y tế" },
  { id: "du-lich", label: "Du lịch" },
];

// Mock entries for UI and local filtering before integrating dictionary API.
export const mockDictionaryEntries: DictionaryEntry[] = [
  {
    id: "xin-chao",
    word: "Xin chào",
    category: "chao-hoi",
    viewsLabel: "1.2k lượt xem",
    imageLabel: "CH",
    imageClass:
      "bg-[radial-gradient(circle_at_24%_28%,#fff4eb_0%,#f7d9c8_38%,#d1a48c_100%)]",
  },
  {
    id: "cha-me",
    word: "Cha mẹ",
    category: "gia-dinh",
    viewsLabel: "850 lượt xem",
    imageLabel: "GĐ",
    imageClass:
      "bg-[radial-gradient(circle_at_78%_22%,#e8fbff_0%,#b9e5ee_36%,#7eabb8_100%)]",
  },
  {
    id: "bac-si",
    word: "Bác sĩ",
    category: "cong-viec",
    viewsLabel: "2.1k lượt xem",
    imageLabel: "CV",
    imageClass:
      "bg-[radial-gradient(circle_at_72%_20%,#dff5ff_0%,#9fcbe0_38%,#5c8ba8_100%)]",
  },
  {
    id: "benh-vien",
    word: "Bệnh viện",
    category: "y-te",
    viewsLabel: "540 lượt xem",
    imageLabel: "YT",
    imageClass:
      "bg-[radial-gradient(circle_at_80%_20%,#e3fff5_0%,#9ddac8_38%,#4f9d88_100%)]",
  },
  {
    id: "cam-on",
    word: "Cảm ơn",
    category: "chao-hoi",
    viewsLabel: "3.4k lượt xem",
    imageLabel: "CH",
    imageClass:
      "bg-[radial-gradient(circle_at_24%_22%,#f3fff5_0%,#c7ebcc_40%,#8fbe96_100%)]",
  },
  {
    id: "ban-be",
    word: "Bạn bè",
    category: "gia-dinh",
    viewsLabel: "920 lượt xem",
    imageLabel: "GĐ",
    imageClass:
      "bg-[radial-gradient(circle_at_76%_24%,#fff9e2_0%,#f4dfab_40%,#c5ab67_100%)]",
  },
  {
    id: "may-tinh",
    word: "Máy tính",
    category: "cong-viec",
    viewsLabel: "1.5k lượt xem",
    imageLabel: "CV",
    imageClass:
      "bg-[radial-gradient(circle_at_74%_20%,#f0f8ff_0%,#bad1e6_38%,#7795b2_100%)]",
  },
  {
    id: "khau-trang",
    word: "Khẩu trang",
    category: "y-te",
    viewsLabel: "430 lượt xem",
    imageLabel: "YT",
    imageClass:
      "bg-[radial-gradient(circle_at_78%_20%,#f0fff9_0%,#b8e6d2_40%,#77b79d_100%)]",
  },
  {
    id: "xin-loi",
    word: "Xin lỗi",
    category: "chao-hoi",
    viewsLabel: "680 lượt xem",
    imageLabel: "CH",
    imageClass:
      "bg-[radial-gradient(circle_at_22%_24%,#fff1ee_0%,#f7c8c0_38%,#d98b7d_100%)]",
  },
  {
    id: "gia-dinh",
    word: "Gia đình",
    category: "gia-dinh",
    viewsLabel: "1.1k lượt xem",
    imageLabel: "GĐ",
    imageClass:
      "bg-[radial-gradient(circle_at_72%_22%,#f0ffef_0%,#c7e8b8_38%,#8ab070_100%)]",
  },
  {
    id: "du-an",
    word: "Dự án",
    category: "cong-viec",
    viewsLabel: "760 lượt xem",
    imageLabel: "CV",
    imageClass:
      "bg-[radial-gradient(circle_at_74%_24%,#eef8ff_0%,#bfd8eb_40%,#7f9fb9_100%)]",
  },
  {
    id: "duoc-si",
    word: "Dược sĩ",
    category: "y-te",
    viewsLabel: "590 lượt xem",
    imageLabel: "YT",
    imageClass:
      "bg-[radial-gradient(circle_at_76%_20%,#e7fff4_0%,#b7e8cf_36%,#74b297_100%)]",
  },
  {
    id: "khach-san",
    word: "Khách sạn",
    category: "du-lich",
    viewsLabel: "640 lượt xem",
    imageLabel: "DL",
    imageClass:
      "bg-[radial-gradient(circle_at_76%_20%,#fff8ec_0%,#f3dbb0_40%,#bf9656_100%)]",
  },
  {
    id: "may-bay",
    word: "Máy bay",
    category: "du-lich",
    viewsLabel: "1.9k lượt xem",
    imageLabel: "DL",
    imageClass:
      "bg-[radial-gradient(circle_at_74%_22%,#f2f9ff_0%,#bcd5ea_40%,#7a99b3_100%)]",
  },
];
