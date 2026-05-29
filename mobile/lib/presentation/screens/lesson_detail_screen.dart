import 'package:flutter/material.dart';
import '../../data/models/lesson_model.dart';
import '../../core/theme/app_theme.dart';
import 'gesture_test_screen.dart';

class LessonDetailScreen extends StatelessWidget {
  final LessonModel lesson;

  const LessonDetailScreen({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(lesson.title),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.bgGradient),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Video Player Container Visual Placeholder
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Card(
                  elevation: 6,
                  shadowColor: AppTheme.primaryColor.withOpacity(0.1),
                  clipBehavior: Clip.antiAlias,
                  margin: EdgeInsets.zero,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Dark slate background for premium feel
                      Container(color: const Color(0xFF1E293B)),
                      
                      // Decorative icon patterns
                      const Icon(
                        Icons.smart_display_rounded,
                        size: 72,
                        color: Colors.white24,
                      ),
                      
                      // Visual Play overlay
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: theme.primaryColor,
                        child: const Icon(
                          Icons.play_arrow_rounded,
                          size: 36,
                          color: Colors.white,
                        ),
                      ),
                      
                      // Title label at the bottom
                      Positioned(
                        bottom: 12,
                        left: 16,
                        child: Text(
                          "Video bài học: ${lesson.title}",
                          style: const TextStyle(
                            color: Colors.white70,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // 2. Lesson Description Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Lý thuyết bài giảng",
                            style: theme.textTheme.titleLarge?.copyWith(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          _buildRewardChip(lesson.xpEarned),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        lesson.content ?? "Bài giảng tập trung hướng dẫn chi tiết các ký hiệu, biểu cảm và chuyển động ngón tay chuẩn cho từ khóa trong bài học. Hãy chú ý theo dõi video hướng dẫn kỹ lưỡng trước khi bắt đầu bài kiểm tra nhận diện cử chỉ thô bằng AI.",
                        style: theme.textTheme.bodyLarge?.copyWith(height: 1.5, fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 36),

              // 3. AI Camera Test Action Button
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => GestureTestScreen(lesson: lesson),
                    ),
                  );
                },
                icon: const Icon(Icons.camera_front_rounded, size: 20),
                label: const Text(
                  "Bắt Đầu Kiểm Tra AI",
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: theme.primaryColor,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRewardChip(int xp) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFDF7E2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.amber.withOpacity(0.2), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt_rounded, color: Colors.amber, size: 14),
          const SizedBox(width: 3),
          Text(
            "+$xp XP",
            style: const TextStyle(
              color: Color(0xFFB45309),
              fontWeight: FontWeight.bold,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}
