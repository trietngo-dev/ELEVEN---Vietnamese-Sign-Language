# Báo cáo: Deep Code Understanding Final Project
**Môn học**: PRM393 - Mobile Application Development
**Tên dự án**: VSL Learner (Vietnamese Sign Language Learning App)
**Tên nhóm**: Eleven
**Thành viên**: Nhóm Eleven
**Link GitHub**: https://github.com/trietnpse180186/ELEVEN---Vietnamese-Sign-Language

---

## Phần 1: Tổng quan project

Nhóm mô tả ngắn gọn project của mình:
* **Tên project**: VSL Learner (Ứng dụng học Ngôn ngữ ký hiệu Việt Nam)
* **Mục tiêu chính**: Cung cấp một nền tảng học tập Ngôn ngữ Ký hiệu Việt Nam (VSL) trực quan, hiện đại, tích hợp công nghệ AI nhận diện cử chỉ qua camera selfie của điện thoại để giúp học viên thực hành và nhận đánh giá độ chính xác tức thời.
* **Người dùng chính**: Học viên muốn học ngôn ngữ ký hiệu Việt Nam, người khiếm thính và cộng đồng muốn kết nối, giao tiếp hiệu quả với người khiếm thính.
* **Các chức năng chính**:
  1. **Xác thực tài khoản (Authentication)**: Đăng ký, đăng nhập tài khoản học viên thông qua REST API .NET Core Backend, hỗ trợ tự động đăng nhập (Auto-login) qua SharedPreferences và đăng nhập qua Google & Firebase Authentication.
  2. **Học theo chủ đề (Learning Catalog)**: Xem danh mục khóa học (Chào hỏi, Số đếm, Gia đình, v.v.), xem chi tiết khóa học, chi tiết bài học và xem video hướng dẫn bài học trực quan.
  3. **Luyện tập cử chỉ với AI (AI Grading Exercise)**: Cho phép mở camera trước để luyện tập các ký hiệu tay, xử lý luồng ảnh và giao tiếp qua native Android MethodChannel (MediaPipe Holistic Tracking) để trích xuất 306 tọa độ khớp tay.
  4. **Chấm điểm & Dịch thuật (AI Grading & Translation)**: Gửi các vector tọa độ khớp tay lên API server (`/api/gesture/predict`) để phân tích cử chỉ, chấm điểm độ chính xác. Đồng thời ghép chuỗi các từ ký hiệu thành câu tiếng Việt hoàn chỉnh trôi chảy qua API dịch thuật (`/api/gesture/translate-sentence`).
  5. **Theo dõi tiến độ (Progress Tracking)**: Thống kê số từ đã học, số ngày học liên tiếp (Streak), xem lịch sử học tập.
  6. **Cài đặt & Trợ giúp (Settings & Support)**: Cài đặt tài khoản (đổi họ tên, số điện thoại, đổi mật khẩu, bật tắt thông báo nhắc nhở học) và gửi yêu cầu phản hồi lỗi ứng dụng.
* **Công nghệ sử dụng**: Flutter (Dart SDK ^3.11.5), BLoC / Cubit Pattern (Quản lý trạng thái và logic giao diện), SharedPreferences (Lưu session token cục bộ), Dio Client (Kết nối API HTTP), Firebase (Auth, Core, Messaging), Camera (Bắt luồng video), MethodChannel (MediaPipe Holistic), Google Fonts (Be Vietnam Pro).

---

## Phần 2: Vẽ kiến trúc source code

### Sơ đồ kiến trúc thư mục dự án (`lib/`)

```text
  lib/
  ├── firebase_options.dart
  ├── main.dart
  ├── core/
  │   ├── constants/
  │   │   └── api_constants.dart (Định nghĩa URL động API và các endpoint)
  │   ├── network/
  │   │   └── dio_client.dart (Cấu hình Dio client và Interceptor tự động thêm Authorization Token)
  │   ├── services/
  │   │   └── push_notification_service.dart (Firebase Cloud Messaging nhận thông báo đẩy)
  │   ├── theme/
  │   │   └── app_theme.dart (Chủ đề tối cao cấp với panel kính mờ Glassmorphism)
  │   └── utils/
  │       └── sign_language_processor.dart (Xử lý ảnh camera và MethodChannel với native Android xử lý MediaPipe)
  ├── data/
  │   ├── datasources/
  │   │   ├── auth_remote_data_source.dart (API auth backend, Firebase và Google Sign In)
  │   │   ├── gesture_data_source.dart (Gửi tọa độ tay lên mô hình nhận diện cử chỉ)
  │   │   └── learning_remote_data_source.dart (Lấy danh mục khóa học, lưu tiến trình học)
  │   ├── models/ (UserModel, CourseModel, LessonModel, EnrollmentModel, v.v.)
  │   └── repositories/ (AuthRepositoryImpl, GestureRepositoryImpl, LearningRepositoryImpl)
  ├── domain/
  │   ├── entities/ (UserEntity, CourseEntity, LessonEntity, v.v.)
  │   ├── repositories/ (Các interface trừu tượng cho repository layer)
  │   └── usecases/ (Use Cases nghiệp vụ: login_usecase, enroll_in_course_usecase, predict_gesture_usecase, v.v.)
  └── presentation/
      ├── bloc/ (AuthBloc, GestureBloc, LearningCubit)
      └── screens/
          ├── welcome_screen.dart (Màn hình chào mừng)
          ├── login_screen.dart (Màn hình đăng nhập kính mờ)
          ├── register_screen.dart (Màn hình đăng ký tài khoản)
          ├── home_screen.dart (Màn hình Dashboard chính)
          ├── course_details_screen.dart (Thông tin khóa học)
          ├── lesson_screen.dart (Video & chi tiết bài học)
          ├── ai_grading_exercise_screen.dart (Quét camera selfie chấm điểm AI)
          ├── ai_grading_score_screen.dart (Báo cáo điểm số & độ chính xác)
          ├── completed_words_history_screen.dart (Lịch sử học tập)
          ├── library_screen.dart (Từ điển ký hiệu VSL)
          ├── profile_screen.dart (Thông tin cá nhân & Streak)
          ├── setting_screen.dart (Cấu hình tài khoản & Về ứng dụng)
          └── support_screen.dart (Gửi yêu cầu hỗ trợ)
```

### Câu hỏi kiến trúc và trả lời:

1. **Folder nào chứa UI?**
   * Folder [lib/presentation/screens/](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/screens) chứa giao diện người dùng các màn hình chính.
2. **Folder nào chứa xử lý logic?**
   * Folder [lib/presentation/bloc/](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/bloc) (Quản lý trạng thái và logic giao diện thông qua BLoC/Cubit) và [lib/domain/usecases/](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/domain/usecases) chứa logic nghiệp vụ cốt lõi (Business Logic UseCases).
3. **Folder nào gọi API hoặc database?**
   * Folder [lib/data/datasources/](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/data/datasources) chứa các file remote data source gọi trực tiếp REST API (như `auth_remote_data_source.dart`, `gesture_data_source.dart`, `learning_remote_data_source.dart`).
4. **Folder nào quản lý state?**
   * Folder [lib/presentation/bloc/](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/bloc) quản lý state toàn ứng dụng bằng Flutter BLoC & Cubit.
5. **Nếu muốn sửa giao diện màn hình chính thì sửa file nào?**
   * Sửa file [lib/presentation/screens/home_screen.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/screens/home_screen.dart).
6. **Nếu muốn sửa logic thêm sản phẩm vào giỏ hàng thì sửa file nào?**
   * Trong dự án học tập VSL Learner, chức năng nghiệp vụ tương đương là "Ghi danh khóa học" (Enroll Course) hoặc "Lưu tiến độ bài học" (Complete Lesson). Nếu muốn sửa logic ghi danh khóa học, chúng ta sửa file UseCase [lib/domain/usecases/learning/enroll_in_course_usecase.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/domain/usecases/learning/enroll_in_course_usecase.dart) ở tầng nghiệp vụ, [lib/data/repositories/learning_repository_impl.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/data/repositories/learning_repository_impl.dart) và [lib/data/datasources/learning_remote_data_source.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/data/datasources/learning_remote_data_source.dart) ở tầng dữ liệu.

---

## Phần 3: Trace một chức năng quan trọng

* **Chức năng được chọn**: Đăng nhập tài khoản (Login)

### Luồng chạy chi tiết của chức năng Đăng nhập:

* **Bước 1**: Học viên nhập Email, Mật khẩu và nhấn nút **"ĐĂNG NHẬP"** tại giao diện màn hình [login_screen.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/screens/login_screen.dart).
* **Bước 2**: Hàm `_onLoginPressed()` trong `login_screen.dart` được gọi, thực hiện validate dữ liệu đầu vào. Nếu hợp lệ, nó sẽ gửi sự kiện `AuthLoginRequested` (kèm email và mật khẩu) tới `AuthBloc`.
* **Bước 3**: [auth_bloc.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/bloc/auth/auth_bloc.dart) nhận được sự kiện, phát ra trạng thái `AuthLoading` (để màn hình hiển thị vòng xoay chờ trên nút bấm) và gọi đối tượng UseCase `loginUseCase`.
* **Bước 4**: `loginUseCase` (định nghĩa trong [login_usecase.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/domain/usecases/auth/login_usecase.dart)) thực hiện gọi phương thức `login()` của `AuthRepository`.
* **Bước 5**: `AuthRepositoryImpl` (định nghĩa trong [auth_repository_impl.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/data/repositories/auth_repository_impl.dart)) gọi tiếp phương thức `login()` của `AuthRemoteDataSource`.
* **Bước 6**: `AuthRemoteDataSource` (định nghĩa trong [auth_remote_data_source.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/data/datasources/auth_remote_data_source.dart)) gửi yêu cầu POST HTTP tới REST API `/api/users/login` qua `DioClient`.
* **Bước 7**: API Backend phản hồi thành công (HTTP 200/201), `AuthRemoteDataSource` bóc tách mã JWT Token (`token` hoặc `accessToken`) và thông tin người dùng từ JSON, chuyển đổi thành đối tượng `UserModel`, đồng thời lưu trữ cục bộ vào `SharedPreferences` (như `'auth_token'`, `'auth_user_id'`, `'auth_user_name'`, v.v.) để duy trì phiên làm việc cục bộ.
* **Bước 8**: `AuthBloc` nhận kết quả UserModel từ UseCase, phát ra trạng thái thành công `AuthAuthenticated` chứa thông tin user.
* **Bước 9**: Màn hình `login_screen.dart` lắng nghe thấy trạng thái `AuthAuthenticated` qua `BlocConsumer`, thực hiện chuyển hướng người dùng sang màn hình chính [home_screen.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/screens/home_screen.dart) và đồng thời xóa màn hình đăng nhập cũ khỏi Navigation stack (`Navigator.pushAndRemoveUntil`).

### Tóm tắt các yêu cầu bắt buộc:

* **Tên file bắt đầu**: `lib/presentation/screens/login_screen.dart`
* **Tên function bắt đầu**: `_onLoginPressed()` (bấm nút kích hoạt gửi sự kiện `AuthLoginRequested`)
* **Tên file xử lý logic**: `lib/presentation/bloc/auth/auth_bloc.dart`, `lib/domain/usecases/auth/login_usecase.dart`, `lib/data/datasources/auth_remote_data_source.dart`
* **Tên state/database/API bị thay đổi**: API endpoint `/api/users/login`, AuthState chuyển đổi (`AuthInitial` -> `AuthLoading` -> `AuthAuthenticated`), local cache `SharedPreferences` ghi nhận `'auth_token'`.
* **Tên file hiển thị kết quả**: `lib/presentation/screens/home_screen.dart`

---

## Phần 4: Giải thích 5 đoạn code quan trọng

### Đoạn code 1: Quản lý định tuyến và bảo vệ trạng thái người dùng (Auth Wrapper)
* **Tên file**: [lib/main.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/main.dart#L271-L295)
* **Đoạn code**:
  ```dart
  class AuthWrapper extends StatelessWidget {
    const AuthWrapper({super.key});

    @override
    Widget build(BuildContext context) {
      return BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthAuthenticated) {
            return const HomeScreen();
          } else if (state is AuthUnauthenticated || state is AuthFailure) {
            return const WelcomeScreen();
          }
          
          // Splash / Initial Loading State
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
              ),
            ),
          );
        },
      );
    }
  }
  ```
* **Đoạn code này làm gì?**: Đây là bộ định tuyến gốc (Root Navigation Filter). Nó lắng nghe trạng thái đăng nhập từ `AuthBloc`. Nếu người dùng đã đăng nhập (`AuthAuthenticated`), điều hướng thẳng tới `HomeScreen`. Nếu chưa (`AuthUnauthenticated` hoặc lỗi `AuthFailure`), điều hướng tới `WelcomeScreen`. Trong khi chờ xác thực thì hiện vòng quay loading.
* **Vì sao đoạn code này quan trọng?**: Nó đóng vai trò bảo vệ các màn hình nội bộ, ngăn chặn người dùng chưa xác thực truy cập vào tài nguyên học tập và hỗ trợ tính năng tự động đăng nhập mượt mà.
* **Nếu đoạn code này bị sai thì app sẽ bị lỗi gì?**: Người dùng sẽ bị kẹt vĩnh viễn ở màn hình chờ khởi động, hoặc có thể truy cập trái phép vào `HomeScreen` khi chưa đăng nhập dẫn đến các lỗi Null Pointer Exception khi lấy thông tin cá nhân.

### Đoạn code 2: Giao tiếp API và lưu cache cục bộ
* **Tên file**: [lib/data/datasources/auth_remote_data_source.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/data/datasources/auth_remote_data_source.dart#L14-L55)
* **Đoạn code**:
  ```dart
  Future<UserModel> login(String email, String password) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        final token = (data['token'] ?? 
            data['accessToken'] ?? 
            data['sessionToken'] ?? 
            data['AccessToken'] ?? 
            data['SessionToken']) as String?;
        final userJson = data['user'] as Map<String, dynamic>? ?? data;

        final user = UserModel.fromJson(userJson, token: token);
        
        // Save auth token and user profile details locally
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', token);
          await prefs.setInt('auth_user_id', user.id);
          await prefs.setString('auth_user_role', user.role);
          await prefs.setString('auth_user_name', user.fullName);
          await prefs.setString('auth_user_email', user.email);
        }
        
        return user;
      } else {
        throw Exception(response.data['message'] ?? 'Đăng nhập thất bại.');
      }
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ hoặc sai thông tin.';
      throw Exception(message);
    } catch (e) {
      throw Exception('Lỗi không xác định: ${e.toString()}');
    }
  }
  ```
* **Đoạn code này làm gì?**: Gửi yêu cầu POST đăng nhập kèm email/mật khẩu tới .NET API. Khi thành công, nó bóc tách token, parse JSON thành model và tiến hành ghi đè thông tin đăng nhập vào bộ nhớ thiết bị (`SharedPreferences`).
* **Vì sao đoạn code này quan trọng?**: Đây là nơi cầu nối trực tiếp giao dịch dữ liệu nhạy cảm của người dùng giữa thiết bị di động và Server Backend.
* **Nếu đoạn code này bị sai thì app sẽ bị lỗi gì?**: Học viên không thể đăng nhập tài khoản, hoặc đăng nhập được nhưng tắt ứng dụng mở lại sẽ bị mất phiên hoạt động.

### Đoạn code 3: Tự động đính kèm Token Bảo mật (Dio Interceptor)
* **Tên file**: [lib/core/network/dio_client.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/core/network/dio_client.dart#L17-L29)
* **Đoạn code**:
  ```dart
      _dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          return handler.next(e);
        },
      ));
  ```
* **Đoạn code này làm gì?**: Thiết lập bộ đánh chặn (Interceptor) cho mọi yêu cầu mạng qua Dio Client. Trước khi request gửi đi, nó đọc token cục bộ và tự động chèn header `'Authorization': 'Bearer <token>'`.
* **Vì sao đoạn code này quan trọng?**: Tiết kiệm code lặp lại, đảm bảo mọi kết nối API cần xác thực quyền học tập đều được đính kèm chữ ký bảo mật một cách tự động và đồng bộ.
* **Nếu đoạn code này bị sai thì app sẽ bị lỗi gì?**: Các màn hình bài học, lịch sử học tập, streak hoạt động sẽ bị server trả về mã lỗi `401 Unauthorized` do gửi request trắng không có token.

### Đoạn code 4: Nhận diện và Xử lý Trạng thái Logic Đăng nhập (Auth Bloc)
* **Tên file**: [lib/presentation/bloc/auth/auth_bloc.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/bloc/auth/auth_bloc.dart#L44-L52)
* **Đoạn code**:
  ```dart
      on<AuthLoginRequested>((event, emit) async {
        emit(AuthLoading());
        try {
          final user = await loginUseCase(event.email, event.password);
          emit(AuthAuthenticated(user));
        } catch (e) {
          emit(AuthFailure(e.toString().replaceAll('Exception: ', '')));
        }
      });
  ```
* **Đoạn code này làm gì?**: Tiếp nhận sự kiện yêu cầu đăng nhập từ UI, phát đi trạng thái `AuthLoading` để cập nhật giao diện, gọi Use Case xử lý nghiệp vụ bất đồng bộ và phát ra trạng thái thành công (`AuthAuthenticated`) hoặc lỗi (`AuthFailure`) tương ứng.
* **Vì sao đoạn code này quan trọng?**: Đây là bộ điều khiển (Controller) trung tâm quản lý luồng dữ liệu của tính năng xác thực, phân tách UI và API Data.
* **Nếu đoạn code này bị sai thì app sẽ bị lỗi gì?**: Nút bấm đăng nhập không hoạt động, màn hình không thể hiện vòng loading, hoặc không bắt được thông báo lỗi từ backend để in ra màn hình.

### Đoạn code 5: Phương thức bắt luồng ảnh camera selfie giao tiếp MethodChannel (MediaPipe)
* **Tên file**: [lib/core/utils/sign_language_processor.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/core/utils/sign_language_processor.dart#L38-L95)
* **Đoạn code**:
  ```dart
    Future<List<double>> processImage(InputImage inputImage) async {
      if (_isProcessing) return [];
      _isProcessing = true;

      try {
        List<double> holisticFeatures = List.generate(306, (_) => 0.0);
        if (defaultTargetPlatform == TargetPlatform.android &&
            inputImage.bytes != null) {
          try {
            await initialize();
            final List<dynamic>? nativeResult = await _platformChannel
                .invokeMethod('processFrame', {
              'bytes': inputImage.bytes,
              'width': inputImage.metadata?.size.width.toInt(),
              'height': inputImage.metadata?.size.height.toInt(),
            });
            if (nativeResult != null) {
              holisticFeatures = nativeResult.cast<double>();
            }
          } catch (e) {
            debugPrint("Lỗi native holistic tracking: $e");
          }
        }

        _isProcessing = false;
        latestCroppedFeatures = List<double>.from(holisticFeatures);

        // Spatial Normalization relative to Nose
        if (holisticFeatures.isNotEmpty) {
          final noseX = holisticFeatures[0];
          final noseY = holisticFeatures[1];
          final noseZ = holisticFeatures[2];

          if (noseX != 0.0 || noseY != 0.0 || noseZ != 0.0) {
            for (int i = 0; i < holisticFeatures.length; i += 3) {
              if (holisticFeatures[i] != 0.0 ||
                  holisticFeatures[i + 1] != 0.0 ||
                  holisticFeatures[i + 2] != 0.0) {
                holisticFeatures[i] -= noseX;
                holisticFeatures[i + 1] -= noseY;
                holisticFeatures[i + 1] *= 1.3333333; // Restore 3:4 aspect ratio
                holisticFeatures[i + 2] -= noseZ;
              }
            }
          }
        }

        return holisticFeatures;
      } catch (e) {
        _isProcessing = false;
        debugPrint("Lỗi phân tích hình ảnh: $e");
        return [];
      }
    }
  ```
* **Đoạn code này làm gì?**: Nhận frame ảnh từ camera, chuyển tiếp thông tin dạng byte qua MethodChannel 'processFrame' xuống mã native Android chạy MediaPipe Holistic để lấy ra các tọa độ điểm khớp tay, mặt, tư thế. Sau đó nó thực hiện chuẩn hóa không gian lấy điểm Mũi làm gốc tọa độ.
* **Vì sao đoạn code này quan trọng?**: Đây là thành phần cốt lõi của tính năng nhận diện cử chỉ. Nó giúp tiền xử lý dữ liệu thô từ camera trước khi gửi lên mô hình AI phân loại, đảm bảo mô hình AI hoạt động chính xác bất kể vị trí đứng của người dùng.
* **Nếu đoạn code này bị sai thì app sẽ bị lỗi gì?**: App không thể nhận diện được cử chỉ ngôn ngữ ký hiệu của người dùng. Camera vẫn mở nhưng không có phản hồi chấm điểm khi luyện tập cử chỉ.

---

## Phần 5: Tìm 3 điểm yếu trong source code

* **Điểm yếu 1**: Tác vụ ghi đè cache `SharedPreferences` được gọi trực tiếp trong lớp dữ liệu mạng `AuthRemoteDataSource`.
  * *Vấn đề*: Vi phạm nguyên lý đơn nhiệm (Single Responsibility Principle). Lớp Remote Data Source chỉ nên quản lý luồng dữ liệu API qua mạng. Việc lưu trữ cache cục bộ nên được quản lý bởi một lớp `AuthLocalDataSource` chuyên biệt.
  * *Cách cải thiện*: Tách biệt lớp lưu trữ cục bộ thành `AuthLocalDataSource` và chèn (inject) nó thông qua Repository layer.
* **Điểm yếu 2**: Địa chỉ máy chủ (Base URL) của API .NET được gán cứng (hardcoded) trong code cấu hình dự án.
  * *Vấn đề*: Việc khai báo cứng địa chỉ IP máy chủ trong code (để trỏ sang .NET Backend) khiến việc chia sẻ dự án giữa các thành viên gặp bất tiện khi thay đổi mạng kết nối Wifi (do IP thay đổi) và không đảm bảo tính bảo mật.
  * *Cách cải thiện*: Chuyển cấu hình Base URL sang tệp cấu hình môi trường `.env` hoặc truyền biến động qua `--dart-define` khi chạy lệnh build ứng dụng.
* **Điểm yếu 3**: Thiếu cơ chế tự động làm mới mã bảo mật (Token Refresh Interceptor).
  * *Vấn đề*: JWT Token có thời hạn sử dụng. Nếu token hết hạn khi người dùng đang thao tác học bài, các API gửi kết quả sẽ lập tức bị lỗi `401 Unauthorized` và đẩy người dùng ra ngoài màn hình Welcome một cách đột ngột.
  * *Cách cải thiện*: Xây dựng thêm cơ chế Refresh Token lồng trong `DioClient` Interceptor.

---

## Phần 6: Refactor một phần code

### Code cũ (nằm tại validator của Email trong [register_screen.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/presentation/screens/register_screen.dart#L251-L260)):

```dart
validator: (value) {
  if (value == null || value.trim().isEmpty) {
    return 'Vui lòng nhập email';
  }
  final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
  if (!emailRegex.hasMatch(value.trim())) {
    return 'Vui lòng nhập email hợp lệ';
  }
  return null;
},
```

### Vấn đề của code cũ:
1. **Trùng lặp mã nguồn**: Biểu thức chính quy (RegExp) và logic validate email được viết trực tiếp trong widget giao diện, dẫn đến việc lặp lại mã nguồn ở cả màn hình Đăng ký, Đăng nhập, và Đổi thông tin.
2. **Biểu thức RegExp lỏng lẻo**: Biểu thức `r'^[^@]+@[^@]+\.[^@]+'` quá đơn giản, có thể chấp nhận các địa chỉ email sai cú pháp thực tế (ví dụ: `abc@domain..com` hoặc domain không có đuôi mở rộng hợp lệ).
3. **Vi phạm Clean Architecture**: Logic validate nghiệp vụ bị trộn lẫn trong UI Presentation Layer.

### Code mới:

1. **Tạo file helper xác thực dùng chung** tại `lib/core/utils/validation_utils.dart`:
```dart
class ValidationUtils {
  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Vui lòng nhập email';
    }
    // Biểu thức chính quy tiêu chuẩn RFC 5322
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Vui lòng nhập email hợp lệ';
    }
    return null;
  }
}
```

2. **Gọi ngắn gọn trong Widget UI** (`register_screen.dart` và `login_screen.dart`):
```dart
TextFormField(
  controller: _emailController,
  keyboardType: TextInputType.emailAddress,
  decoration: const InputDecoration(
    prefixIcon: Icon(Icons.mail_outline_rounded),
    hintText: 'example@email.com',
  ),
  validator: ValidationUtils.validateEmail, // Sử dụng hàm static dùng chung
)
```

### Code mới tốt hơn ở điểm nào?
* **Khả năng tái sử dụng cao**: Tránh lặp lại mã nguồn regex ở nhiều màn hình. Nếu cần thay đổi luật validate, chỉ cần sửa đổi tại 1 nơi duy nhất.
* **Bảo mật và chuẩn xác**: Sử dụng biểu thức chính quy tiêu chuẩn giúp phát hiện chính xác các email sai định dạng nâng cao.
* **Tách biệt mối quan tâm**: Presentation UI sạch sẽ hơn, chỉ tập trung vẽ giao diện, nhường logic kiểm tra nghiệp vụ cho Utility Layer.

---

## Phần 7: Thêm một chức năng nhỏ

* **Tên chức năng mới**: Thêm mục "Thông tin & Điều khoản" (About App Dialog) trong màn hình Cài đặt (SettingScreen).
* **Lý do thêm chức năng**: Giúp học viên dễ dàng xem thông tin chi tiết về phiên bản ứng dụng, đội ngũ phát triển (Nhóm Eleven), mục tiêu môn học (PRM393) và truy cập nhanh các điều khoản dịch vụ (tương ứng với file tài liệu điều khoản 'EXE101-Eleven - Điều khoản dịch vụ.pdf' của dự án).
* **Những file đã sửa**: `lib/presentation/screens/setting_screen.dart`
* **Luồng hoạt động**:
  1. Học viên mở ứng dụng VSL Learner, truy cập vào màn hình Cài đặt tài khoản (`SettingScreen`).
  2. Phía dưới mục "Thông báo", xuất hiện thêm một Section mới mang tên "Về ứng dụng" chứa mục ListTile "Thông tin & Điều khoản" kèm biểu tượng chữ 'i' nhỏ.
  3. Khi người dùng nhấn chọn mục này, hàm `_showAboutAppDialog()` được kích hoạt, hiển thị một hộp thoại AlertDialog làm mờ hậu cảnh.
  4. Hộp thoại hiển thị Logo ứng dụng (`AssetImage assets/logo.jpg`), tên app "VSL Learner - Phiên bản 1.0.0", giới thiệu ngắn gọn về công nghệ nhận diện AI MediaPipe và tên nhóm phát triển (Nhóm Eleven - Lớp PRM393).
  5. Người dùng nhấn nút "Đóng" để giải phóng hộp thoại và quay lại màn hình Cài đặt.
* **Ảnh chụp màn hình trước và sau khi thêm**:
  * *Trước khi thêm*: Màn hình Cài đặt chỉ gồm 3 phần chính: Thông tin cá nhân, Bảo mật, Thông báo và Vùng nguy hiểm.
  * *Sau khi thêm*: Xuất hiện thêm phần "Về ứng dụng" ở vị trí trước "Vùng nguy hiểm". Khi bấm vào, một hộp thoại Glassmorphism hiện lên hiển thị thông tin phiên bản 1.0.0 cùng logo VSL Learner và tên nhóm Eleven.

---

## Phần 8: Câu hỏi bảo vệ source code (Gợi ý câu trả lời tốt nhất)

### Câu hỏi kiến trúc
1. **Vì sao nhóm chia folder như hiện tại?**
   * *Trả lời*: Nhóm chia theo cấu trúc Clean Architecture rút gọn gồm: `core` (theme, constants, network), `data` (models, datasources, repositories) và `presentation` (bloc, screens). Việc này giúp tách biệt rõ ràng giữa tầng hiển thị UI, tầng nghiệp vụ (Business Logic) và tầng dữ liệu (Data Access), giúp dễ phát triển song song trong nhóm và bảo trì mở rộng sau này.
2. **File nào là điểm bắt đầu của app?**
   * *Trả lời*: File [lib/main.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/main.dart).
3. **Component nào được tái sử dụng nhiều nhất?**
   * *Trả lời*: Helper widget `AppTheme.glassPanel()` được sử dụng ở mọi màn hình để vẽ các khung panel tối kính mờ đồng nhất.
4. **Logic chính của project nằm ở đâu?**
   * *Trả lời*: Logic nghiệp vụ chính (Business Logic) nằm ở các lớp **BLoC/Cubit** trong thư mục `lib/presentation/bloc/` và các **UseCases** trong `lib/domain/usecases/`.
5. **Nếu project lớn hơn, nhóm sẽ tổ chức lại source code như thế nào?**
   * *Trả lời*: Nhóm sẽ tách dự án ra các Feature Module (ví dụ: chia thành thư mục `features/auth/`, `features/learning/`, `features/gesture/`, mỗi feature sẽ có đầy đủ data, domain, presentation riêng) thay vì gom chung toàn bộ screens và datasource như hiện tại để tránh việc xung đột code khi dự án phình to.

### Câu hỏi về dữ liệu
6. **Dữ liệu trong app đến từ đâu?**
   * *Trả lời*: Đến từ API Backend được viết bằng .NET Core chạy dưới máy chủ dịch vụ.
7. **Dữ liệu được lưu ở đâu?**
   * *Trả lời*: Các dữ liệu tạm thời/trạng thái UI được lưu trong bộ nhớ RAM qua BLoC. Các dữ liệu phiên đăng nhập (Token, User Info) được lưu lâu dài cục bộ trong bộ nhớ flash thiết bị qua `SharedPreferences`. Các dữ liệu cốt lõi (bài học, tài khoản) lưu trên SQL Server thông qua Backend.
8. **Khi người dùng thao tác, state nào thay đổi?**
   * *Trả lời*: Ví dụ khi nhập liệu và bấm đăng nhập, state trong `AuthBloc` thay đổi tuần tự: `AuthInitial` -> `AuthLoading` -> `AuthAuthenticated` (hoặc `AuthFailure`).
9. **Nếu API/database bị lỗi thì app xử lý thế nào?**
   * *Trả lời*: App bắt lỗi mạng qua Dio (try-catch `DioException`), giải nén thông điệp lỗi từ API (ví dụ: *Lỗi kết nối máy chủ*) và nạp vào trạng thái `AuthFailure` để hiển thị hộp thoại SnackBar đỏ báo lỗi thân thiện cho người dùng thay vì crash app.
10. **Có dữ liệu nào cần validate không?**
    * *Trả lời*: Dữ liệu email (đúng định dạng RegExp), mật khẩu (độ dài >= 6 ký tự) và mật khẩu xác nhận (trùng khớp) tại màn hình đăng nhập/đăng ký.

### Câu hỏi về code
11. **Function nào quan trọng nhất trong project?**
    * *Trả lời*: Hàm `processImage()` trong `SignLanguageProcessor` quyết định việc xử lý và chuẩn hóa dữ liệu camera, cùng với hàm `login()` trong `AuthRemoteDataSource` quyết định luồng xác thực của người dùng.
12. **Đoạn code nào nhóm thấy khó nhất?**
    * *Trả lời*: Logic bắt và giải mã luồng ảnh từ Camera trước chuyển dữ liệu pixel gửi qua MethodChannel để xử lý MediaPipe Holistic thời gian thực ở native Android mà không làm đơ giật UI.
13. **Có đoạn code nào nhóm lấy từ AI không? Nhóm đã hiểu và chỉnh sửa gì?**
    * *Trả lời*: Nhóm có tham khảo AI để viết biểu thức chính quy (RegExp) validate email và cấu hình bộ lọc làm mờ BackdropFilter cho hiệu ứng kính mờ. Nhóm đã tối ưu hóa thông số blur (sigma) và bo góc ClipRRect để hiển thị mượt mà trên các kích thước màn hình di động khác nhau.
14. **Nếu xóa một file quan trọng thì app sẽ lỗi như thế nào?**
    * *Trả lời*: Nếu xóa file [lib/main.dart](file:///c:/Users/Triet/MyProject/vsl-platform/prm393/lib/main.dart), app sẽ không thể khởi chạy (thiếu hàm `main`). Nếu xóa `AuthBloc`, toàn bộ ứng dụng sẽ báo lỗi biên dịch đỏ ở mọi nơi tham chiếu đến việc đăng nhập và định tuyến.
15. **Nếu thêm một chức năng mới, nhóm sẽ bắt đầu sửa từ đâu?**
    * *Trả lời*: Bắt đầu từ việc định nghĩa Use Case mới trong Domain layer, triển khai DataSource/Repository tương ứng ở Data layer, sau đó tạo Cubit/Bloc ở Presentation layer và cuối cùng là vẽ Widget UI kết nối Bloc đó.
