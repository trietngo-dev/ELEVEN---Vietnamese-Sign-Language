# Công Nghệ Sử Dụng - VSL Mobile App

Tài liệu này ghi chép lại toàn bộ kiến trúc công nghệ, các thư viện chính và luồng xử lý dữ liệu đang được áp dụng trong thư mục `mobile`.

---

## 1. Công Nghệ Cốt Lõi (Core Stack)

*   **Framework chính:** [Flutter](https://flutter.dev/) (Dart) - Hỗ trợ xây dựng ứng dụng đa nền tảng với hiệu năng cao.
*   **Quản lý trạng thái (State Management):** [flutter_bloc](https://pub.dev/packages/flutter_bloc) - Triển khai kiến trúc BLoC (Business Logic Component) giúp tách biệt rõ ràng giữa giao diện (UI) và logic nghiệp vụ.
*   **Hệ điều hành kiểm thử chính:** Android (minSdk tương thích từ Android 7.0 / SDK 24 trở lên nhờ yêu cầu của MediaPipe).

---

## 2. Hệ Thống Nhận Diện AI & Trích Xuất Khung Xương (AI & Computer Vision)

Ứng dụng sử dụng mô hình kết hợp thời gian thực để trích xuất cử chỉ tay, dáng người và biểu cảm khuôn mặt.

### Phía Native Android (Kotlin & MediaPipe Tasks)
Để tối ưu hóa hiệu năng trên thiết bị di động, phần nhận diện landmark được đưa xuống tầng Native Android thông qua **MethodChannel** (`com.eleven.vsl/hand_tracker`):
*   **SDK xử lý:** `com.google.mediapipe:tasks-vision:0.10.14` - Thư viện MediaPipe Tasks thế hệ mới của Google.
*   **Mô hình sử dụng:** **`HolisticLandmarker`** (`holistic_landmarker.task`) được tải từ thư mục `assets`. Mô hình này chạy song song việc nhận diện 33 điểm Pose, 468 điểm Face và 2x21 điểm Hands.
*   **Thu nhận khung hình:** Sử dụng **CameraX** (`androidx.camera:camera-core:1.3.1`) để đọc luồng ảnh định dạng NV21/YUV từ camera trước một cách mượt mà và chuyển đổi sang Bitmap để chạy suy đoán.
*   **Bộ lọc đặc trưng (Feature Filter):** Mã Kotlin native sẽ lọc các landmark thô thu được về đúng cấu hình định dạng huấn luyện:
    *   **9 điểm Pose:** Mũi (0), Vai (11, 12), Khuỷu tay (13, 14), Cổ tay (15, 16), Hông (23, 24).
    *   **51 điểm Face:** Các điểm quanh miệng và lông mày (giống kịch bản train AI).
    *   **42 điểm Hands:** 21 điểm tay trái + 21 điểm tay phải.
    *   **Tổng cộng:** 102 điểm landmark $\times$ 3 tọa độ (X, Y, Z) = **306 floats** truyền về Flutter.

### Phía Flutter (Dart & Logic Xử Lý)
*   **Truyền nhận dữ liệu:** Qua `MethodChannel.invokeMethod('processFrame')` trả về danh sách 306 số thực trên mỗi frame hình.
*   **Chuẩn hóa không gian (Spatial Normalization):** Tọa độ của toàn bộ các điểm được chuẩn hóa tương đối (trừ đi tọa độ) của điểm Mũi (Nose landmark) ở index đầu tiên để loại bỏ sự ảnh hưởng khi người dùng di chuyển vị trí xa/gần hoặc lệch trái/phải khung hình.
*   **Làm mịn chuyển động (Motion Smoothing):** Áp dụng thuật toán **EMA (Exponential Moving Average)** với hệ số $\alpha = 0.35$ trực tiếp trên Flutter để giảm thiểu độ rung nhiễu của camera mà không gây trễ đáng kể.
*   **Vẽ khung xương (Skeletal Visualization):** Sử dụng `CustomPaint` và `CustomPainter` để vẽ trực tiếp khung xương thân trên và bàn tay lên màn hình live-preview để phản hồi trực quan cho người dùng.

---

## 3. Quản Lý Dữ Liệu & Mạng (Networking & Storage)

*   **HTTP Client:** [Dio](https://pub.dev/packages/dio) - Thư viện kết nối API mạnh mẽ hỗ trợ Interceptors để tự động đính kèm token bảo mật và cấu hình Base URL động.
*   **Lưu trữ cục bộ (Local Storage):** [shared_preferences](https://pub.dev/packages/shared_preferences) - Lưu trữ các cài đặt người dùng, thông tin đăng nhập (token, userId) và tiến trình học tập tạm thời.

---

## 4. Giao Diện Người Dùng (UI/UX)

*   **Theme & Styling:** Triển khai thiết kế hiện đại (Modern Web/Mobile Aesthetics) với bảng màu gradient Sleek Green và Dark Slate độc quyền, hỗ trợ bo tròn góc lớn và các hiệu ứng bóng mờ (Card Elevation).
*   **Font chữ:** [Google Fonts (Outfit)](https://pub.dev/packages/google_fonts) mang lại cảm giác cao cấp và dễ đọc.
*   **Trình phát đa phương tiện:** [video_player](https://pub.dev/packages/video_player) - Dùng để phát video hướng dẫn ký hiệu mẫu trong các bài học.
*   **Chọn tệp tin:** [image_picker](https://pub.dev/packages/image_picker) - Hỗ trợ chụp ảnh trực tiếp hoặc chọn ảnh từ thư viện để cập nhật ảnh đại diện người dùng.

---

## 5. Danh Sách Thư Viện Chi Tiết (`pubspec.yaml`)

| Tên Package | Phiên bản | Mục đích sử dụng |
| :--- | :--- | :--- |
| `flutter_bloc` | `^8.1.3` | Quản lý trạng thái và luồng dữ liệu nhận diện cử chỉ. |
| `dio` | `^5.7.0` | Gọi REST API kết nối với hệ thống Backend. |
| `camera` | `^0.11.0` | Quản lý vòng đời camera, stream khung hình thô. |
| `shared_preferences` | `^2.3.2` | Lưu trữ cấu hình và token người dùng cục bộ. |
| `google_fonts` | `^6.2.1` | Sử dụng font chữ cao cấp Outfit/Inter. |
| `video_player` | `^2.11.1` | Phát các video bài học ký hiệu VSL. |
| `image_picker` | `^1.1.2` | Chọn ảnh đại diện từ thiết bị. |
| `google_mlkit_pose_detection` | `^0.12.1` | Thư viện ML Kit (dự phòng cấu hình). |
| `google_mlkit_face_detection` | `^0.11.0` | Thư viện ML Kit (dự phòng cấu hình). |
