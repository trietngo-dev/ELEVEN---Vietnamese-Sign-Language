import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/usecases/learning/fetch_user_streak_usecase.dart';
import '../../domain/usecases/learning/fetch_total_completed_words_usecase.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';
import '../bloc/learning/learning_cubit.dart';
import 'welcome_screen.dart';
import 'setting_screen.dart';
import 'support_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  int _streakDays = 0;
  int _completedWords = 0;
  bool _isLoadingData = true;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    if (!mounted) return;
    setState(() {
      _isLoadingData = true;
    });

    try {
      final authState = context.read<AuthBloc>().state;
      if (authState is AuthAuthenticated) {
        final userId = authState.user.id;
        final fetchUserStreakUseCase = context.read<FetchUserStreakUseCase>();
        final fetchTotalCompletedWordsUseCase = context.read<FetchTotalCompletedWordsUseCase>();

        final results = await Future.wait([
          fetchUserStreakUseCase(userId),
          fetchTotalCompletedWordsUseCase(userId),
        ]);

        if (mounted) {
          setState(() {
            _streakDays = results[0];
            _completedWords = results[1];
            _isLoadingData = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _isLoadingData = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoadingData = false;
        });
      }
    }
  }

  void _onLogout(BuildContext context) {
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

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String fullName = 'Nguyễn Văn A';
        String email = 'vana.nguyen@vsl.edu.vn';
        int userId = 0;
        if (state is AuthAuthenticated) {
          fullName = state.user.fullName;
          email = state.user.email;
          userId = state.user.id;
        }

        return RefreshIndicator(
          onRefresh: _loadProfileData,
          color: AppTheme.primaryColor,
          backgroundColor: AppTheme.surfaceContainer,
          child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // User Identity Card (Bento style)
                AppTheme.glassPanel(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      Stack(
                        alignment: Alignment.bottomRight,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppTheme.primaryColor,
                            ),
                            child: const CircleAvatar(
                              radius: 40,
                              backgroundImage: NetworkImage(
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuDkHvc1OAbrFlPLQk3MYJmUDKLjX8esIAhQ4u6n53nXfA7dMVyVkgawl7vPoe2fzM1fcvtLvEa2AhheS8SFIdunxTXAYmhImHbNRaYUnA29KaLgYYk63ymCi0CoQMKdIejzBnIXlYdPj8s5Lx9fN04iGxzyd4HysHnCns3xQw5rGIVOMWZCs5XgJoemuBphccLg5tBGeDlCear_fdeXAlxVtSR2kB6-0svViKzGg8ICXrei1Xggzx0EE3c7otUpCBDp9p5ZL7qjt84',
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppTheme.primaryContainer,
                            ),
                            child: const Icon(
                              Icons.verified_rounded,
                              size: 14,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        fullName,
                        style: textTheme.headlineMedium?.copyWith(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Học viên VSL Trung cấp',
                        style: textTheme.bodyMedium?.copyWith(
                          fontSize: 13,
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              'Học viên xuất sắc',
                              style: textTheme.labelLarge?.copyWith(
                                fontSize: 10,
                                color: AppTheme.secondaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              'Tuần 4',
                              style: textTheme.labelLarge?.copyWith(
                                fontSize: 10,
                                color: const Color(0xFFD0BCFF),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Streak & Quick Stats Row
                Row(
                  children: [
                    // Streak Card
                    Expanded(
                      child: AppTheme.glassPanel(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Chuỗi học',
                                  style: textTheme.labelLarge?.copyWith(
                                    fontSize: 11,
                                    color: AppTheme.onSurfaceVariant,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const Icon(
                                  Icons.local_fire_department_rounded,
                                  color: AppTheme.primaryColor,
                                  size: 24,
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: '$_streakDays ',
                                    style: textTheme.headlineLarge?.copyWith(
                                      fontSize: 28,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.primaryColor,
                                    ),
                                  ),
                                  TextSpan(
                                    text: 'ngày',
                                    style: textTheme.bodyMedium?.copyWith(
                                      fontSize: 13,
                                      color: AppTheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            // Mini progress indicator bar
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: _streakDays > 0 ? 1.0 : 0.0,
                                minHeight: 6,
                                backgroundColor: Colors.white10,
                                valueColor: const AlwaysStoppedAnimation(AppTheme.primaryColor),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _streakDays > 0 ? 'Đang giữ lửa! 🔥' : 'Bắt đầu học ngay! ⚡',
                              style: textTheme.bodyMedium?.copyWith(
                                fontSize: 11,
                                color: AppTheme.primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Completed Words Card (replaces Mastery Card)
                    Builder(
                      builder: (cardCtx) {
                        final totalLessons = cardCtx.watch<LearningCubit>().state.allLessons.length;
                        final double progressRatio = totalLessons > 0 ? (_completedWords / totalLessons) : 0.0;
                        final int percentage = (progressRatio * 100).toInt();

                        return Expanded(
                          child: AppTheme.glassPanel(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Độ thuần phục',
                                      style: textTheme.labelLarge?.copyWith(
                                        fontSize: 11,
                                        color: AppTheme.onSurfaceVariant,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const Icon(
                                      Icons.school_rounded,
                                      color: AppTheme.secondaryColor,
                                      size: 24,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                RichText(
                                  text: TextSpan(
                                    children: [
                                      TextSpan(
                                        text: '$_completedWords',
                                        style: textTheme.headlineLarge?.copyWith(
                                          fontSize: 28,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.secondaryColor,
                                        ),
                                      ),
                                      TextSpan(
                                        text: ' / $totalLessons từ',
                                        style: textTheme.bodyMedium?.copyWith(
                                          fontSize: 13,
                                          color: AppTheme.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: progressRatio,
                                    minHeight: 6,
                                    backgroundColor: Colors.white10,
                                    valueColor: const AlwaysStoppedAnimation(AppTheme.secondaryColor),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  percentage > 0 ? 'Tuyệt vời! $percentage% 🌟' : 'Bắt đầu học thôi! 🚀',
                                  style: textTheme.bodyMedium?.copyWith(
                                    fontSize: 11,
                                    color: AppTheme.secondaryColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Weekly Activity Chart
                AppTheme.glassPanel(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Hoạt động tuần này',
                            style: textTheme.headlineSmall?.copyWith(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'T2 - CN',
                              style: textTheme.bodyMedium?.copyWith(
                                fontSize: 11,
                                color: AppTheme.onSurfaceVariant,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // Bars Row
                      SizedBox(
                        height: 120,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            _buildChartBar('T2', 0.3, '15p', textTheme),
                            _buildChartBar('T3', 0.6, '30p', textTheme),
                            _buildChartBar('T4', 0.45, '22p', textTheme),
                            _buildChartBar('T5', 0.9, '45p', textTheme, isActive: true),
                            _buildChartBar('T6', 0.2, '10p', textTheme),
                            _buildChartBar('T7', 0.1, '5p', textTheme),
                            _buildChartBar('CN', 0.05, '2p', textTheme),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Tổng thời gian: 2h 15m',
                            style: textTheme.bodyMedium?.copyWith(
                              fontSize: 12,
                              color: AppTheme.onSurfaceVariant,
                            ),
                          ),
                          Text(
                            '+15% so với tuần trước',
                            style: textTheme.bodyMedium?.copyWith(
                              fontSize: 12,
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Settings & Actions Menu List
                AppTheme.glassPanel(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      _buildMenuItem(
                        icon: Icons.settings_rounded,
                        title: 'Cài đặt tài khoản',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SettingScreen(
                                userId: userId,
                                initialName: fullName,
                                initialEmail: email,
                                initialPhone: '090 123 4567',
                              ),
                            ),
                          ).then((_) => _loadProfileData());
                        },
                      ),
                      Divider(color: Colors.white.withOpacity(0.05), height: 1),
                      _buildMenuItem(
                        icon: Icons.help_center_rounded,
                        title: 'Trợ giúp & Hỗ trợ',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const SupportScreen()),
                          );
                        },
                      ),
                      Divider(color: Colors.white.withOpacity(0.05), height: 1),
                      _buildMenuItem(
                        icon: Icons.logout_rounded,
                        title: 'Đăng xuất',
                        titleColor: const Color(0xFFE46C6C),
                        onTap: () => _onLogout(context),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  );
}

  Widget _buildChartBar(
    String label,
    double heightPct,
    String value,
    TextTheme textTheme, {
    bool isActive = false,
  }) {
    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            value,
            style: textTheme.bodyMedium?.copyWith(
              fontSize: 9,
              color: isActive ? AppTheme.primaryColor : AppTheme.onSurfaceVariant.withOpacity(0.6),
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: FractionallySizedBox(
              heightFactor: heightPct,
              alignment: Alignment.bottomCenter,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 6.0),
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                  color: isActive
                      ? AppTheme.primaryColor
                      : AppTheme.primaryColor.withOpacity(0.35),
                  boxShadow: isActive
                      ? [
                          BoxShadow(
                            color: AppTheme.primaryColor.withOpacity(0.4),
                            blurRadius: 8,
                            offset: const Offset(0, -2),
                          ),
                        ]
                      : null,
                ),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: textTheme.bodyMedium?.copyWith(
              fontSize: 11,
              color: isActive ? AppTheme.primaryColor : AppTheme.onSurfaceVariant,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color titleColor = Colors.white,
  }) {
    return ListTile(
      leading: Icon(icon, color: titleColor == Colors.white ? AppTheme.onSurfaceVariant : titleColor, size: 22),
      title: Text(
        title,
        style: TextStyle(
          color: titleColor,
          fontWeight: FontWeight.w600,
          fontSize: 14,
        ),
      ),
      trailing: titleColor == Colors.white
          ? const Icon(Icons.chevron_right_rounded, color: AppTheme.onSurfaceVariant, size: 20)
          : null,
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 4.0),
    );
  }
}


