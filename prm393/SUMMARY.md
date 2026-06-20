# Báo cáo kết quả triển khai dự án PRM393 - Giai đoạn 1

Tài liệu này ghi lại chi tiết các đầu việc, cấu trúc thư mục, hệ thống thiết kế và luồng xử lý xác thực đã được xây dựng hoàn tất cho dự án di động PRM393 (nhánh `feature/welcome-auth`).

---

## 1. Hệ Thống Thiết Kế (Design System)
Tệp chi tiết lưu tại [DESIGN.md](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/DESIGN.md) phác thảo các quy chuẩn giao diện tối kính mờ (Premium Glassmorphism) khớp 100% với bản vẽ Stitch của dự án **VSL Modern Learning App**:
- **Bảng màu chủ đạo**:
  - `primary`: `#4EDEA3` (Xanh lục bảo phát sáng)
  - `background`: `#0E1511` (Màu tối xanh rừng sâu)
  - `secondary`: `#ADC6FF` (Xanh dương nhạt)
  - `surface-container`: `#1A211D` (Màu panel tối nền mờ)
- **Quy chuẩn Kính mờ (Glassmorphism)**:
  - Sử dụng nền trong suốt `Colors.white.withOpacity(0.08)`.
  - Làm mờ hậu cảnh (`BackdropFilter` với `sigma: 16` đến `24`).
  - Viền mỏng bán trong suốt gradient nhẹ `Border.all(color: Colors.white.withOpacity(0.1))`.
- **Phông chữ**: Nạp phông chữ **Be Vietnam Pro** thông qua thư viện `google_fonts`.

---

## 2. Kiến Trúc Thư Mục & Các File Đã Tạo (`lib/`)

Dự án tuân thủ mô hình **Modular / Clean Architecture** tinh gọn để dễ dàng chia sẻ đầu việc phát triển:

```text
lib/
├── core/
│   ├── constants/
│   │   └── api_constants.dart (Định nghĩa base URL & cổng API .NET động)
│   ├── network/
│   │   └── dio_client.dart (Cấu hình Dio Client và Authorization Interceptor)
│   └── theme/
│       └── app_theme.dart (Theme tối toàn hệ thống & helper glassPanel)
├── data/
│   ├── datasources/
│   │   └── auth_remote_data_source.dart (Tác vụ Login/Register/Logout/Cache với API .NET)
│   └── models/
│       └── user_model.dart (Model User, parse JSON thông minh tương thích .NET)
├── presentation/
│   ├── bloc/
│   │   └── auth/ (Quản lý trạng thái xác thực bằng AuthBloc)
│   │       ├── auth_bloc.dart
│   │       ├── auth_event.dart
│   │       └── auth_state.dart
│   └── screens/
│       ├── welcome_screen.dart (Màn hình Welcome giới thiệu)
│       ├── login_screen.dart (Màn hình Đăng nhập kính mờ, validate, báo lỗi đỏ)
│       ├── register_screen.dart (Màn hình Đăng ký tài khoản, khớp mật khẩu)
│       └── home_screen.dart (Màn hình Home hiển thị tiến trình, topics bento & đăng xuất)
└── main.dart (Khởi tạo dependency, bọc BlocProvider và điều hướng luồng)
```

---

## 3. Chi Tiết Triển Khai Luồng Xác Thực (Authentication Flow)

1. **Kiểm tra phiên đăng nhập khi mở app**:
   - Khi khởi chạy, `main.dart` gọi sự kiện `AuthCheckRequested` lên `AuthBloc`.
   - `AuthRemoteDataSource` kiểm tra sự tồn tại của `auth_token` trong `SharedPreferences`.
   - Nếu có token hợp lệ, chuyển thẳng người dùng vào `HomeScreen`, ngược lại chuyển về `WelcomeScreen`.
2. **Gửi yêu cầu mạng (`Dio`)**:
   - Mọi request của hệ thống đều đi qua `DioClient`, tự động chèn header `'Authorization': 'Bearer <token>'` nếu người dùng đã đăng nhập.
   - Cổng kết nối tự động nhận dạng môi trường: dùng `http://10.0.97.69:5000` cho giả lập Android và `http://localhost:5000` cho trình duyệt web.
3. **Đăng nhập (`/api/users/login`) & Đăng ký (`/api/users/register`)**:
   - Lưu trữ an toàn `token`, `id`, `fullName`, `email`, và `role` vào bộ nhớ máy (`SharedPreferences`) ngay sau khi API phản hồi thành công.
   - Hiển thị hộp thoại báo lỗi bắt mắt nếu sai tài khoản/mật khẩu hoặc email đăng ký đã tồn tại.
4. **Đăng xuất**:
   - Xóa sạch các cache phiên lưu trữ trong bộ nhớ và đưa người dùng trở lại màn hình Welcome.

---

## 4. Giao Diện Các Màn Hình Đã Hoàn Thiện (Glassmorphic Screens)

- **Màn hình Welcome (`welcome_screen.dart`)**:
  - Giao diện có ánh sáng hào quang xanh lơ mờ ảo phát sáng ở nền.
  - Một panel kính hiển thị tiến trình AI phân tích độ chính xác tay.
  - Nút "Bắt đầu ngay" bo tròn lớn phủ bóng lục bảo dẫn vào luồng đăng nhập.
- **Màn hình Đăng nhập (`login_screen.dart`)**:
  - Panel đăng nhập nổi mờ (blur 24px) chứa các trường Email/Username và Mật khẩu.
  - Ô nhập mật khẩu trang bị nút bật/tắt hiển thị mật khẩu.
  - Nút "Đăng nhập" dạng gradient hiển thị vòng quay loading trong khi gọi API.
- **Màn hình Đăng ký (`register_screen.dart`)**:
  - Trường nhập liệu: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu.
  - Cơ chế validate tự động báo lỗi trực tiếp nếu thông tin rỗng, sai định dạng email hoặc xác nhận mật khẩu không trùng khớp.
- **Màn hình Home (`home_screen.dart`)**:
  - Lời chào cá nhân hóa hiển thị tên người dùng lấy từ API/SharedPreferences.
  - Vòng tiến trình mục tiêu ngày xoay tròn đẹp mắt (75%) cùng bento metrics (ngày liên tiếp, từ vựng mới).
  - Bento grid chủ đề phổ biến (Chào hỏi, Số đếm, Gia đình) kèm thanh tiến độ riêng cho từng chủ đề.
  - Tích hợp nút Đăng xuất trên AppBar và Profile BottomNav để dễ dàng kiểm thử luồng auth.

---

## 5. Kết Quả Xác Minh Biên Dịch

- Dự án đã được kiểm thử biên dịch tĩnh bằng lệnh:
  ```bash
  flutter analyze
  ```
- **Kết quả**: **Thành công 100%** không phát hiện lỗi cú pháp (`0 errors`) hay cảnh báo (`0 warnings`) nào trên toàn bộ mã nguồn Dart của dự án PRM393.
