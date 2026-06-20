import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_theme.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';
import 'welcome_screen.dart';
import 'library_screen.dart';
import 'profile_screen.dart';
import 'notification_screen.dart';
import 'course_details_screen.dart';
import 'completed_words_history_screen.dart';
import '../../data/models/enrollment_model.dart';
import '../bloc/learning/learning_cubit.dart';
import '../bloc/learning/learning_state.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = context.read<AuthBloc>().state;
      int userId = 3;
      if (authState is AuthAuthenticated) {
        userId = authState.user.id;
      }
      context.read<LearningCubit>().loadCatalog(userId);
    });
  }

  void _onLogout() {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainer,
        title: const Text('Đăng xuất'),
        content: const Text('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Hủy', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              context.read<AuthBloc>().add(AuthLogoutRequested());
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE46C6C)),
            child: const Text('Đăng xuất', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget? _buildAppBar(BuildContext context, TextTheme textTheme, String username) {
    if (_currentIndex == 0) {
      return AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppTheme.surfaceContainerHighest,
              child: const Icon(Icons.person_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Xin chào,',
                    style: textTheme.bodyMedium?.copyWith(
                      fontSize: 12,
                      color: AppTheme.onSurfaceVariant,
                    ),
                  ),
                  Text(
                    username,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: textTheme.bodyLarge?.copyWith(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded, color: AppTheme.onSurfaceVariant),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CompletedWordsHistoryScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.onSurfaceVariant),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFE46C6C)),
            onPressed: _onLogout,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: Colors.white.withOpacity(0.05),
            height: 1.0,
          ),
        ),
      );
    } else if (_currentIndex == 1) {
      return AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        title: Text(
          'VSL LEARNER',
          style: textTheme.headlineSmall?.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded, color: AppTheme.onSurfaceVariant),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CompletedWordsHistoryScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.onSurfaceVariant),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationScreen()),
              );
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: Colors.white.withOpacity(0.05),
            height: 1.0,
          ),
        ),
      );
    } else {
      return AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        title: Text(
          'VSL LEARNER',
          style: textTheme.headlineSmall?.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded, color: AppTheme.onSurfaceVariant),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CompletedWordsHistoryScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.onSurfaceVariant),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationScreen()),
              );
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: Colors.white.withOpacity(0.05),
            height: 1.0,
          ),
        ),
      );
    }
  }

  Widget _buildBody(String username) {
    switch (_currentIndex) {
      case 0:
        return _buildHomeContent(username);
      case 1:
        return const LibraryScreen();
      case 2:
        return const ProfileScreen();
      default:
        return _buildHomeContent(username);
    }
  }

  Widget _buildHomeContent(String username) {
    final textTheme = Theme.of(context).textTheme;

    return BlocBuilder<LearningCubit, LearningState>(
      builder: (context, state) {
        // Calculate average enrollment progress
        double overallProgress = 0.0;
        int userId = 3;
        final authState = context.read<AuthBloc>().state;
        if (authState is AuthAuthenticated) {
          userId = authState.user.id;
        }

        if (state.enrollments.isNotEmpty) {
          double total = 0.0;
          for (final e in state.enrollments) {
            total += e.progressPercent;
          }
          overallProgress = total / state.enrollments.length;
        }
        final overallProgressFraction = overallProgress / 100.0;

        // Find progress of "Chào hỏi" (course ID 6)
        final chaoHoiEnroll = state.enrollments.firstWhere(
          (e) => e.courseId == 6,
          orElse: () => EnrollmentModel(
            id: 0,
            userId: userId,
            courseId: 6,
            progressPercent: 0.0,
            status: 'NotStarted',
          ),
        );
        final chaoHoiProgress = chaoHoiEnroll.progressPercent / 100.0;

        return Stack(
          children: [
            // Dark background
            Container(color: AppTheme.backgroundColor),
            SafeArea(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 8),
                      // Hero Banner
                      AppTheme.glassPanel(
                        borderRadius: 20.0,
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.white.withOpacity(0.1)),
                              ),
                              child: const Text(
                                'Khóa học mới',
                                style: TextStyle(
                                  color: AppTheme.primaryColor,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Học Ngôn Ngữ Ký Hiệu Mỗi Ngày',
                              style: textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                fontSize: 22,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Bắt đầu hành trình giao tiếp không rào cản với bài học 15 phút hôm nay.',
                              style: textTheme.bodyMedium?.copyWith(
                                color: AppTheme.onSurfaceVariant,
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const CourseDetailsScreen(courseId: 6, courseTitle: 'Chào hỏi'),
                                  ),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryContainer,
                                foregroundColor: AppTheme.onPrimaryContainer,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                elevation: 0,
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'Ấn Để Bắt Đầu',
                                    style: TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(width: 8),
                                  Icon(Icons.play_arrow_rounded, size: 16),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Progress Panel
                      AppTheme.glassPanel(
                        borderRadius: 20.0,
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Tiến trình học tập',
                                  style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                ),
                                Icon(Icons.trending_up_rounded, color: AppTheme.primaryColor),
                              ],
                            ),
                            const SizedBox(height: 24),
                            // Circular Progress Ring
                            Center(
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  SizedBox(
                                    width: 120,
                                    height: 120,
                                    child: CircularProgressIndicator(
                                      value: overallProgressFraction,
                                      strokeWidth: 10,
                                      backgroundColor: Colors.white.withOpacity(0.05),
                                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                                    ),
                                  ),
                                  Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        '${overallProgress.toInt()}%',
                                        style: textTheme.headlineMedium?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.primaryColor,
                                          fontSize: 26,
                                        ),
                                      ),
                                      Text(
                                        'Mục tiêu ngày',
                                        style: textTheme.bodyMedium?.copyWith(
                                          fontSize: 11,
                                          color: AppTheme.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),
                            // Divider line
                            Container(
                              height: 1.0,
                              color: Colors.white.withOpacity(0.1),
                            ),
                            const SizedBox(height: 16),
                            // Metrics Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                Column(
                                  children: [
                                    Text(
                                      '${state.streakDays}',
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Ngày liên tiếp',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  width: 1,
                                  height: 32,
                                  color: Colors.white.withOpacity(0.1),
                                ),
                                Column(
                                  children: [
                                    const Text(
                                      '84',
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Từ vựng mới',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Popular Topics Section
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Chủ đề phổ biến',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              TextButton(
                                onPressed: () {
                                  setState(() {
                                    _currentIndex = 1; // Swap to Library tab
                                  });
                                },
                                child: const Text(
                                  'Xem tất cả',
                                  style: TextStyle(color: AppTheme.primaryColor),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          // List of Topic Cards
                          _buildTopicCard(
                            icon: Icons.waving_hand_rounded,
                            title: 'Chào hỏi',
                            lessonsCount: 2,
                            progress: chaoHoiProgress,
                            courseId: 6,
                          ),
                          const SizedBox(height: 12),
                          _buildTopicCard(
                            icon: Icons.onetwothree_rounded,
                            title: 'Số đếm',
                            lessonsCount: 10,
                            progress: 0.0,
                            courseId: 7,
                          ),
                          const SizedBox(height: 12),
                          _buildTopicCard(
                            icon: Icons.family_restroom_rounded,
                            title: 'Gia đình',
                            lessonsCount: 20,
                            progress: 0.0,
                            courseId: 8,
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String username = 'Học viên VSL';
        if (state is AuthAuthenticated) {
          username = state.user.fullName;
        }

        return Scaffold(
          appBar: _buildAppBar(context, textTheme, username),
          body: _buildBody(username),
          bottomNavigationBar: ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16.0),
              topRight: Radius.circular(16.0),
            ),
            child: Container(
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: Colors.white.withOpacity(0.1),
                    width: 1.0,
                  ),
                ),
              ),
              child: BottomNavigationBar(
                currentIndex: _currentIndex,
                onTap: (index) {
                  setState(() {
                    _currentIndex = index;
                  });
                },
                backgroundColor: AppTheme.surfaceColor.withOpacity(0.8),
                selectedItemColor: AppTheme.primaryColor,
                unselectedItemColor: AppTheme.onSurfaceVariant,
                showSelectedLabels: true,
                showUnselectedLabels: true,
                type: BottomNavigationBarType.fixed,
                items: const [
                  BottomNavigationBarItem(
                    icon: Icon(Icons.dashboard_rounded),
                    label: 'Home',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.menu_book_rounded),
                    label: 'Library',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.person_rounded),
                    label: 'Profile',
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTopicCard({
    required IconData icon,
    required String title,
    required int lessonsCount,
    required double progress,
    required int courseId,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CourseDetailsScreen(courseId: courseId, courseTitle: title),
          ),
        );
      },
      child: AppTheme.glassPanel(
        borderRadius: 16.0,
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppTheme.primaryColor, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$lessonsCount bài học',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: progress,
                      backgroundColor: Colors.white.withOpacity(0.05),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                      minHeight: 4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
