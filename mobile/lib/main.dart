import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/network/dio_client.dart';
import 'core/theme/app_theme.dart';
import 'data/datasources/auth_data_source.dart';
import 'data/datasources/course_data_source.dart';
import 'data/datasources/gesture_data_source.dart';
import 'data/datasources/profile_data_source.dart';
import 'presentation/bloc/auth_bloc.dart';
import 'presentation/bloc/course_bloc.dart';
import 'presentation/bloc/gesture_bloc.dart';
import 'presentation/screens/welcome_screen.dart';
import 'presentation/screens/home_screen.dart';

import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. Initialize core dependencies
  final dioClient = DioClient();
  
  final authDataSource = AuthDataSource(dioClient);
  final courseDataSource = CourseDataSource(dioClient);
  final gestureDataSource = GestureDataSource(dioClient);
  final profileDataSource = ProfileDataSource(dioClient);

  try {
    final prefs = await SharedPreferences.getInstance();
    AppTheme.isWhiteBgNotifier.value = prefs.getBool('is_white_bg') ?? true;
  } catch (_) {}

  runApp(
    MyApp(
      authDataSource: authDataSource,
      courseDataSource: courseDataSource,
      gestureDataSource: gestureDataSource,
      profileDataSource: profileDataSource,
    ),
  );
}

class MyApp extends StatelessWidget {
  final AuthDataSource authDataSource;
  final CourseDataSource courseDataSource;
  final GestureDataSource gestureDataSource;
  final ProfileDataSource profileDataSource;

  const MyApp({
    super.key,
    required this.authDataSource,
    required this.courseDataSource,
    required this.gestureDataSource,
    required this.profileDataSource,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthDataSource>.value(value: authDataSource),
        RepositoryProvider<CourseDataSource>.value(value: courseDataSource),
        RepositoryProvider<GestureDataSource>.value(value: gestureDataSource),
        RepositoryProvider<ProfileDataSource>.value(value: profileDataSource),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(authDataSource)..add(AuthCheckRequested()),
          ),
          BlocProvider<CourseBloc>(
            create: (context) => CourseBloc(courseDataSource),
          ),
          BlocProvider<GestureBloc>(
            create: (context) => GestureBloc(gestureDataSource),
          ),
        ],
        child: MaterialApp(
          title: 'ELEVEN',
          debugShowCheckedModeBanner: false,

          theme: AppTheme.lightTheme,
          home: BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              if (state is AuthAuthenticated) {
                return const HomeScreen();
              } else if (state is AuthUnauthenticated || state is AuthFailure) {
                return const WelcomeScreen();
              }
              // Elegant splash loader displaying branding logo
              return Scaffold(
                backgroundColor: Colors.white,
                body: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Image.asset(
                          'assets/logo.jpg',
                          width: 120,
                          height: 120,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(height: 24),
                      const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Color(0xFF10B981),
                          strokeWidth: 2.5,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
