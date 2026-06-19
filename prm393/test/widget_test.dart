import 'package:flutter_test/flutter_test.dart';
import 'package:vietnamese_sign_language_platform/main.dart';
import 'package:vietnamese_sign_language_platform/core/network/dio_client.dart';
import 'package:vietnamese_sign_language_platform/data/datasources/auth_remote_data_source.dart';
import 'package:vietnamese_sign_language_platform/data/datasources/learning_remote_data_source.dart';
import 'package:vietnamese_sign_language_platform/data/datasources/gesture_data_source.dart';
import 'package:vietnamese_sign_language_platform/data/repositories/auth_repository_impl.dart';
import 'package:vietnamese_sign_language_platform/data/repositories/learning_repository_impl.dart';
import 'package:vietnamese_sign_language_platform/data/repositories/gesture_repository_impl.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/login_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/register_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/logout_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/check_auth_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/get_cached_user_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/login_with_google_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/delete_account_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/update_user_info_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/update_user_profile_phone_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/change_password_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/auth/get_user_profile_phone_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/load_catalog_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/load_course_details_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/load_lesson_details_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/start_lesson_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/complete_lesson_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/enroll_in_course_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/fetch_video_url_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/fetch_user_streak_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/fetch_total_completed_words_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/learning/fetch_completed_lessons_with_progress_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/gesture/predict_gesture_usecase.dart';
import 'package:vietnamese_sign_language_platform/domain/usecases/gesture/translate_sentence_usecase.dart';

void main() {
  testWidgets('App initialization smoke test', (WidgetTester tester) async {
    final dioClient = DioClient();
    final authRemoteDataSource = AuthRemoteDataSource(dioClient);
    final learningRemoteDataSource = LearningRemoteDataSource(dioClient);
    final gestureDataSource = GestureDataSource(dioClient);

    final authRepository = AuthRepositoryImpl(authRemoteDataSource);
    final learningRepository = LearningRepositoryImpl(learningRemoteDataSource);
    final gestureRepository = GestureRepositoryImpl(gestureDataSource);

    await tester.pumpWidget(MyApp(
      loginUseCase: LoginUseCase(authRepository),
      registerUseCase: RegisterUseCase(authRepository),
      logoutUseCase: LogoutUseCase(authRepository),
      checkAuthUseCase: CheckAuthUseCase(authRepository),
      getCachedUserUseCase: GetCachedUserUseCase(authRepository),
      loginWithGoogleUseCase: LoginWithGoogleUseCase(authRepository),
      deleteAccountUseCase: DeleteAccountUseCase(authRepository),
      updateUserInfoUseCase: UpdateUserInfoUseCase(authRepository),
      updateUserProfilePhoneUseCase: UpdateUserProfilePhoneUseCase(authRepository),
      changePasswordUseCase: ChangePasswordUseCase(authRepository),
      getUserProfilePhoneUseCase: GetUserProfilePhoneUseCase(authRepository),
      
      loadCatalogUseCase: LoadCatalogUseCase(learningRepository),
      loadCourseDetailsUseCase: LoadCourseDetailsUseCase(learningRepository),
      loadLessonDetailsUseCase: LoadLessonDetailsUseCase(learningRepository),
      startLessonUseCase: StartLessonUseCase(learningRepository),
      completeLessonUseCase: CompleteLessonUseCase(learningRepository),
      enrollInCourseUseCase: EnrollInCourseUseCase(learningRepository),
      fetchVideoUrlUseCase: FetchVideoUrlUseCase(learningRepository),
      fetchUserStreakUseCase: FetchUserStreakUseCase(learningRepository),
      fetchTotalCompletedWordsUseCase: FetchTotalCompletedWordsUseCase(learningRepository),
      fetchCompletedLessonsWithProgressUseCase: FetchCompletedLessonsWithProgressUseCase(learningRepository),
      
      predictGestureUseCase: PredictGestureUseCase(gestureRepository),
      translateSentenceUseCase: TranslateSentenceUseCase(gestureRepository),
    ));
    
    expect(find.byType(MyApp), findsOneWidget);
  });
}
