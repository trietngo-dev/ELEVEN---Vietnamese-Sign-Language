# Design System & Tokens - VSL Modern Learning App (PRM393)

Hệ thống thiết kế này được chuyển đổi trực quan từ bản thiết kế trên Google Stitch của dự án **VSL Modern Learning App** (Project ID `9292197557203699026`), áp dụng kỹ thuật hiển thị kính mờ (Glassmorphism) trên nền tối sang trọng.

## 1. Bảng Màu (Color Palette)

| Token | Giá trị Hex | Cách Dùng trong Flutter | Mô tả |
|---|---|---|---|
| `primary` | `#4EDEA3` | `Color(0xFF4EDEA3)` | Xanh lục bảo chủ đạo (emerald green) |
| `primary-container` | `#10B981` | `Color(0xFF10B981)` | Xanh ngọc lục bảo vừa (emerald medium) |
| `on-primary-container` | `#00422B` | `Color(0xFF00422B)` | Chữ trên nền nút xanh |
| `secondary` | `#ADC6FF` | `Color(0xFFADC6FF)` | Xanh dương nhạt bổ trợ |
| `background` | `#0E1511` | `Color(0xFF0E1511)` | Màu nền tối rừng sâu (dark forest background) |
| `on-background` | `#DDE4DD` | `Color(0xFFDDE4DD)` | Màu chữ chính (off-white/light gray) |
| `surface-container` | `#1A211D` | `Color(0xFF1A211D)` | Panel surface tiêu chuẩn |
| `surface-container-high` | `#242C27` | `Color(0xFF242C27)` | Panel surface nâng cao |
| `surface-container-highest` | `#2F3632` | `Color(0xFF2F3632)` | Panel surface nổi bật nhất |
| `surface-container-low` | `#161D19` | `Color(0xFF161D19)` | Panel surface thấp |
| `surface-container-lowest` | `#09100C` | `Color(0xFF09100C)` | Panel surface sâu nhất |
| `on-surface-variant` | `#BBCABF` | `Color(0xFFBBCABF)` | Màu chữ phụ, mô tả ngắn |

## 2. Kính Mờ (Glassmorphism)

Bản thiết kế Stitch sử dụng các panel hiệu ứng kính mờ (Glassmorphism). Cách triển khai trong Flutter:

- **Nền Panel (Glass Panel Background)**: Sử dụng màu trắng trong suốt `Colors.white.withOpacity(0.08)` hoặc `Colors.white.withOpacity(0.05)`.
- **Độ Mờ (Backdrop Filter Blur)**: Sử dụng `BackdropFilter(filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16))` hoặc `24` cho các panel lớn.
- **Viền Panel (Glass Border)**: Sử dụng viền mỏng bán trong suốt với gradient tuyến tính từ trên-trái xuống dưới-phải:
  ```dart
  border: Border.all(
    color: Colors.white.withOpacity(0.1),
    width: 1.0,
  )
  ```
- **Hộp Bóng (Shadow)**: `BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 40, offset: Offset(0, 20))`

## 3. Phông Chữ & Kiểu Dáng (Typography)

Sử dụng phông chữ **Be Vietnam Pro** (được cung cấp thông qua `google_fonts`):

- `headline-xl`: 40px, Bold, Line Height 48px, Letter Spacing -0.02em
- `headline-lg`: 32px, Bold, Line Height 40px, Letter Spacing -0.01em
- `headline-md`: 24px, SemiBold, Line Height 32px
- `body-lg`: 18px, Regular, Line Height 28px
- `body-md`: 16px, Regular, Line Height 24px
- `label-md`: 14px, Medium, Line Height 20px, Letter Spacing 0.05em
