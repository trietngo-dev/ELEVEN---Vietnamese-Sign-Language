import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/entities/lesson_entity.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_state.dart';
import '../bloc/learning/learning_cubit.dart';
import 'ai_grading_exercise_screen.dart';

class AiGradingScoreScreen extends StatelessWidget {
  final LessonEntity lesson;

  const AiGradingScoreScreen({
    super.key,
    required this.lesson,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final learningState = context.read<LearningCubit>().state;
    final currentIndex = learningState.currentCourseLessons.indexWhere((l) => l.id == lesson.id);
    final isLastLesson = currentIndex == -1 || currentIndex == learningState.currentCourseLessons.length - 1;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppTheme.onSurfaceVariant),
          onPressed: () {
            // Pop back to the lesson screen
            Navigator.pop(context);
          },
        ),
        title: Text(
          'VSL LEARNER',
          style: textTheme.headlineSmall?.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.surfaceContainerHighest,
              child: const Icon(Icons.person_rounded, color: Colors.white, size: 16),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: Colors.white.withOpacity(0.05),
            height: 1.0,
          ),
        ),
      ),
      body: Stack(
        children: [
          Container(color: AppTheme.backgroundColor),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Simulated Camera View Box in background mode (dimmed opacity)
                  Expanded(
                    flex: 4,
                    child: Opacity(
                      opacity: 0.35,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24.0),
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceColor,
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.network(
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuD3w63ifAwv25Lwim5ap4c9Zx6lYPmw4Zlh5yanP_O_zrtot1MySo07Wjw2yx4kwHOloOpg7zBdfFOco00JiLRInt1o15AIyd6x-z72xh_Sk9ku6tt47jtrbS5SYgBFZDqv8Mnug5zlKDqzE_k5MjZYzpXS9A8Zjxvbtoklp_B86ECRbf_Di98DQsemG8siFadgwUkFE_fzGL3rRElzJwV6FHVvXsrJ-PdXZJs74r_2KMgK1RefHzpvKnht4l93gjnEmsRvLBven38',
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(
                                  color: Colors.black54,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Score Feedback Panel
                  Expanded(
                    flex: 6,
                    child: AppTheme.glassPanel(
                      borderRadius: 24.0,
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'KẾT QUẢ BÀI TẬP',
                            style: textTheme.labelLarge?.copyWith(
                              fontSize: 12,
                              color: AppTheme.onSurfaceVariant,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Animated radial progress dial showing score 90/100
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 140,
                                height: 140,
                                child: CircularProgressIndicator(
                                  value: 0.90,
                                  strokeWidth: 8,
                                  backgroundColor: Colors.white.withOpacity(0.05),
                                  valueColor: const AlwaysStoppedAnimation(AppTheme.primaryColor),
                                ),
                              ),
                              // Glowing dial shadow
                              Container(
                                width: 140,
                                height: 140,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppTheme.primaryColor.withOpacity(0.1),
                                      blurRadius: 20,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '90',
                                    style: textTheme.displayLarge?.copyWith(
                                      fontSize: 48,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.primaryColor,
                                    ),
                                  ),
                                  Text(
                                    'trên 100',
                                    style: textTheme.bodyMedium?.copyWith(
                                      fontSize: 12,
                                      color: AppTheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Text(
                            'Tuyệt vời!',
                            style: textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              fontSize: 22,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Bạn đã hoàn thành rất tốt cử chỉ của bài học này.',
                            style: textTheme.bodyMedium?.copyWith(
                              fontSize: 13,
                              color: AppTheme.onSurfaceVariant,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Actions area
                  ElevatedButton(
                    onPressed: () {
                      final authState = context.read<AuthBloc>().state;
                      int userId = 3;
                      if (authState is AuthAuthenticated) {
                        userId = authState.user.id;
                      }

                      // Report completion to API
                      context.read<LearningCubit>().completeLesson(
                        userId: userId,
                        lessonId: lesson.id,
                        courseId: lesson.courseId,
                        accuracy: 0.90,
                        score: 90.0,
                        xpEarned: lesson.xpReward,
                      );

                      if (isLastLesson) {
                        Navigator.pop(context, 'completed_course');
                      } else {
                        final nextLesson = learningState.currentCourseLessons[currentIndex + 1];
                        Navigator.pop(context, nextLesson);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: AppTheme.onPrimaryContainer,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      elevation: 8,
                      shadowColor: AppTheme.primaryColor.withOpacity(0.3),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          isLastLesson ? 'HOÀN THÀNH KHÓA HỌC' : 'TIẾP TỤC BÀI HỌC',
                          style: textTheme.labelLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: AppTheme.onPrimaryContainer,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          isLastLesson ? Icons.done_all_rounded : Icons.arrow_forward_rounded,
                          size: 16,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {
                      // Replace current screen with a fresh exercise screen
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) => AiGradingExerciseScreen(lesson: lesson),
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(color: Colors.white.withOpacity(0.12)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.refresh_rounded, size: 18),
                        const SizedBox(width: 6),
                        const Text('LUYỆN TẬP LẠI'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
