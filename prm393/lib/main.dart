import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/network/dio_client.dart';
import 'core/theme/app_theme.dart';
import 'core/services/push_notification_service.dart';

// Data Sources
import 'data/datasources/auth_remote_data_source.dart';
import 'data/datasources/learning_remote_data_source.dart';
import 'data/datasources/gesture_data_source.dart';

// Repositories Implementations
import 'data/repositories/auth_repository_impl.dart';
import 'data/repositories/learning_repository_impl.dart';
import 'data/repositories/gesture_repository_impl.dart';

// Domain Use Cases - Auth
import 'domain/usecases/auth/login_usecase.dart';
import 'domain/usecases/auth/register_usecase.dart';
import 'domain/usecases/auth/logout_usecase.dart';
import 'domain/usecases/auth/check_auth_usecase.dart';
import 'domain/usecases/auth/get_cached_user_usecase.dart';
import 'domain/usecases/auth/login_with_google_usecase.dart';
import 'domain/usecases/auth/delete_account_usecase.dart';
import 'domain/usecases/auth/update_user_info_usecase.dart';
import 'domain/usecases/auth/update_user_profile_phone_usecase.dart';
import 'domain/usecases/auth/change_password_usecase.dart';
import 'domain/usecases/auth/get_user_profile_phone_usecase.dart';

// Domain Use Cases - Learning
import 'domain/usecases/learning/load_catalog_usecase.dart';
import 'domain/usecases/learning/load_course_details_usecase.dart';
import 'domain/usecases/learning/load_lesson_details_usecase.dart';
import 'domain/usecases/learning/start_lesson_usecase.dart';
import 'domain/usecases/learning/complete_lesson_usecase.dart';
import 'domain/usecases/learning/enroll_in_course_usecase.dart';
import 'domain/usecases/learning/fetch_video_url_usecase.dart';
import 'domain/usecases/learning/fetch_user_streak_usecase.dart';
import 'domain/usecases/learning/fetch_total_completed_words_usecase.dart';
import 'domain/usecases/learning/fetch_completed_lessons_with_progress_usecase.dart';

// Domain Use Cases - Gesture
import 'domain/usecases/gesture/predict_gesture_usecase.dart';
import 'domain/usecases/gesture/translate_sentence_usecase.dart';

// Presentation Blocs
import 'presentation/bloc/auth/auth_bloc.dart';
import 'presentation/bloc/auth/auth_event.dart';
import 'presentation/bloc/auth/auth_state.dart';
import 'presentation/bloc/learning/learning_cubit.dart';
import 'presentation/bloc/gesture_bloc.dart';

import 'presentation/screens/welcome_screen.dart';
import 'presentation/screens/home_screen.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize Push Notification Service
  final pushNotificationService = PushNotificationService();
  await pushNotificationService.initialize();
  
  // Set up dependency injection / instances
  final dioClient = DioClient();
  
  // Data Sources
  final authRemoteDataSource = AuthRemoteDataSource(dioClient);
  final learningRemoteDataSource = LearningRemoteDataSource(dioClient);
  final gestureDataSource = GestureDataSource(dioClient);

  // Repositories
  final authRepository = AuthRepositoryImpl(authRemoteDataSource);
  final learningRepository = LearningRepositoryImpl(learningRemoteDataSource);
  final gestureRepository = GestureRepositoryImpl(gestureDataSource);

  // Use Cases - Auth
  final loginUseCase = LoginUseCase(authRepository);
  final registerUseCase = RegisterUseCase(authRepository);
  final logoutUseCase = LogoutUseCase(authRepository);
  final checkAuthUseCase = CheckAuthUseCase(authRepository);
  final getCachedUserUseCase = GetCachedUserUseCase(authRepository);
  final loginWithGoogleUseCase = LoginWithGoogleUseCase(authRepository);
  final deleteAccountUseCase = DeleteAccountUseCase(authRepository);
  final updateUserInfoUseCase = UpdateUserInfoUseCase(authRepository);
  final updateUserProfilePhoneUseCase = UpdateUserProfilePhoneUseCase(authRepository);
  final changePasswordUseCase = ChangePasswordUseCase(authRepository);
  final getUserProfilePhoneUseCase = GetUserProfilePhoneUseCase(authRepository);

  // Use Cases - Learning
  final loadCatalogUseCase = LoadCatalogUseCase(learningRepository);
  final loadCourseDetailsUseCase = LoadCourseDetailsUseCase(learningRepository);
  final loadLessonDetailsUseCase = LoadLessonDetailsUseCase(learningRepository);
  final startLessonUseCase = StartLessonUseCase(learningRepository);
  final completeLessonUseCase = CompleteLessonUseCase(learningRepository);
  final enrollInCourseUseCase = EnrollInCourseUseCase(learningRepository);
  final fetchVideoUrlUseCase = FetchVideoUrlUseCase(learningRepository);
  final fetchUserStreakUseCase = FetchUserStreakUseCase(learningRepository);
  final fetchTotalCompletedWordsUseCase = FetchTotalCompletedWordsUseCase(learningRepository);
  final fetchCompletedLessonsWithProgressUseCase = FetchCompletedLessonsWithProgressUseCase(learningRepository);

  // Use Cases - Gesture
  final predictGestureUseCase = PredictGestureUseCase(gestureRepository);
  final translateSentenceUseCase = TranslateSentenceUseCase(gestureRepository);

  runApp(MyApp(
    loginUseCase: loginUseCase,
    registerUseCase: registerUseCase,
    logoutUseCase: logoutUseCase,
    checkAuthUseCase: checkAuthUseCase,
    getCachedUserUseCase: getCachedUserUseCase,
    loginWithGoogleUseCase: loginWithGoogleUseCase,
    deleteAccountUseCase: deleteAccountUseCase,
    updateUserInfoUseCase: updateUserInfoUseCase,
    updateUserProfilePhoneUseCase: updateUserProfilePhoneUseCase,
    changePasswordUseCase: changePasswordUseCase,
    getUserProfilePhoneUseCase: getUserProfilePhoneUseCase,

    loadCatalogUseCase: loadCatalogUseCase,
    loadCourseDetailsUseCase: loadCourseDetailsUseCase,
    loadLessonDetailsUseCase: loadLessonDetailsUseCase,
    startLessonUseCase: startLessonUseCase,
    completeLessonUseCase: completeLessonUseCase,
    enrollInCourseUseCase: enrollInCourseUseCase,
    fetchVideoUrlUseCase: fetchVideoUrlUseCase,
    fetchUserStreakUseCase: fetchUserStreakUseCase,
    fetchTotalCompletedWordsUseCase: fetchTotalCompletedWordsUseCase,
    fetchCompletedLessonsWithProgressUseCase: fetchCompletedLessonsWithProgressUseCase,

    predictGestureUseCase: predictGestureUseCase,
    translateSentenceUseCase: translateSentenceUseCase,
  ));
}

class MyApp extends StatelessWidget {
  // Auth Use Cases
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;
  final CheckAuthUseCase checkAuthUseCase;
  final GetCachedUserUseCase getCachedUserUseCase;
  final LoginWithGoogleUseCase loginWithGoogleUseCase;
  final DeleteAccountUseCase deleteAccountUseCase;
  final UpdateUserInfoUseCase updateUserInfoUseCase;
  final UpdateUserProfilePhoneUseCase updateUserProfilePhoneUseCase;
  final ChangePasswordUseCase changePasswordUseCase;
  final GetUserProfilePhoneUseCase getUserProfilePhoneUseCase;

  // Learning Use Cases
  final LoadCatalogUseCase loadCatalogUseCase;
  final LoadCourseDetailsUseCase loadCourseDetailsUseCase;
  final LoadLessonDetailsUseCase loadLessonDetailsUseCase;
  final StartLessonUseCase startLessonUseCase;
  final CompleteLessonUseCase completeLessonUseCase;
  final EnrollInCourseUseCase enrollInCourseUseCase;
  final FetchVideoUrlUseCase fetchVideoUrlUseCase;
  final FetchUserStreakUseCase fetchUserStreakUseCase;
  final FetchTotalCompletedWordsUseCase fetchTotalCompletedWordsUseCase;
  final FetchCompletedLessonsWithProgressUseCase fetchCompletedLessonsWithProgressUseCase;

  // Gesture Use Cases
  final PredictGestureUseCase predictGestureUseCase;
  final TranslateSentenceUseCase translateSentenceUseCase;

  const MyApp({
    super.key,
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
    required this.checkAuthUseCase,
    required this.getCachedUserUseCase,
    required this.loginWithGoogleUseCase,
    required this.deleteAccountUseCase,
    required this.updateUserInfoUseCase,
    required this.updateUserProfilePhoneUseCase,
    required this.changePasswordUseCase,
    required this.getUserProfilePhoneUseCase,

    required this.loadCatalogUseCase,
    required this.loadCourseDetailsUseCase,
    required this.loadLessonDetailsUseCase,
    required this.startLessonUseCase,
    required this.completeLessonUseCase,
    required this.enrollInCourseUseCase,
    required this.fetchVideoUrlUseCase,
    required this.fetchUserStreakUseCase,
    required this.fetchTotalCompletedWordsUseCase,
    required this.fetchCompletedLessonsWithProgressUseCase,

    required this.predictGestureUseCase,
    required this.translateSentenceUseCase,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<LoginUseCase>.value(value: loginUseCase),
        RepositoryProvider<RegisterUseCase>.value(value: registerUseCase),
        RepositoryProvider<LogoutUseCase>.value(value: logoutUseCase),
        RepositoryProvider<CheckAuthUseCase>.value(value: checkAuthUseCase),
        RepositoryProvider<GetCachedUserUseCase>.value(value: getCachedUserUseCase),
        RepositoryProvider<LoginWithGoogleUseCase>.value(value: loginWithGoogleUseCase),
        RepositoryProvider<DeleteAccountUseCase>.value(value: deleteAccountUseCase),
        RepositoryProvider<UpdateUserInfoUseCase>.value(value: updateUserInfoUseCase),
        RepositoryProvider<UpdateUserProfilePhoneUseCase>.value(value: updateUserProfilePhoneUseCase),
        RepositoryProvider<ChangePasswordUseCase>.value(value: changePasswordUseCase),
        RepositoryProvider<GetUserProfilePhoneUseCase>.value(value: getUserProfilePhoneUseCase),

        RepositoryProvider<LoadCatalogUseCase>.value(value: loadCatalogUseCase),
        RepositoryProvider<LoadCourseDetailsUseCase>.value(value: loadCourseDetailsUseCase),
        RepositoryProvider<LoadLessonDetailsUseCase>.value(value: loadLessonDetailsUseCase),
        RepositoryProvider<StartLessonUseCase>.value(value: startLessonUseCase),
        RepositoryProvider<CompleteLessonUseCase>.value(value: completeLessonUseCase),
        RepositoryProvider<EnrollInCourseUseCase>.value(value: enrollInCourseUseCase),
        RepositoryProvider<FetchVideoUrlUseCase>.value(value: fetchVideoUrlUseCase),
        RepositoryProvider<FetchUserStreakUseCase>.value(value: fetchUserStreakUseCase),
        RepositoryProvider<FetchTotalCompletedWordsUseCase>.value(value: fetchTotalCompletedWordsUseCase),
        RepositoryProvider<FetchCompletedLessonsWithProgressUseCase>.value(value: fetchCompletedLessonsWithProgressUseCase),

        RepositoryProvider<PredictGestureUseCase>.value(value: predictGestureUseCase),
        RepositoryProvider<TranslateSentenceUseCase>.value(value: translateSentenceUseCase),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(
              loginUseCase: loginUseCase,
              registerUseCase: registerUseCase,
              logoutUseCase: logoutUseCase,
              checkAuthUseCase: checkAuthUseCase,
              getCachedUserUseCase: getCachedUserUseCase,
              loginWithGoogleUseCase: loginWithGoogleUseCase,
              deleteAccountUseCase: deleteAccountUseCase,
            )..add(AuthCheckRequested()),
          ),
          BlocProvider<LearningCubit>(
            create: (context) => LearningCubit(
              loadCatalogUseCase: loadCatalogUseCase,
              loadCourseDetailsUseCase: loadCourseDetailsUseCase,
              loadLessonDetailsUseCase: loadLessonDetailsUseCase,
              startLessonUseCase: startLessonUseCase,
              completeLessonUseCase: completeLessonUseCase,
              enrollInCourseUseCase: enrollInCourseUseCase,
            ),
          ),
          BlocProvider<GestureBloc>(
            create: (context) => GestureBloc(
              predictGestureUseCase: predictGestureUseCase,
              translateSentenceUseCase: translateSentenceUseCase,
            ),
          ),
        ],
        child: MaterialApp(
          title: 'VSL Learner',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.darkTheme,
          home: const AuthWrapper(),
        ),
      ),
    );
  }
}

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
