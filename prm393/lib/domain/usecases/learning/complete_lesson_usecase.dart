import '../../entities/user_lesson_progress_entity.dart';
import '../../repositories/learning_repository.dart';

class CompleteLessonUseCase {
  final LearningRepository repository;

  CompleteLessonUseCase(this.repository);

  Future<void> call({
    required int userId,
    required int lessonId,
    required int courseId,
    double accuracy = 0.0,
    double score = 0.0,
    int xpEarned = 50,
  }) async {
    // Check if this is a new completion (was not status == 2 before)
    bool isNewCompletion = true;
    List<Map<String, dynamic>> completedHistory = [];
    try {
      final currentProgressList = await repository.fetchUserProgress(userId, courseId);
      final lessonProgressIndex = currentProgressList.indexWhere((p) => p.lessonId == lessonId);
      if (lessonProgressIndex != -1) {
        isNewCompletion = currentProgressList[lessonProgressIndex].status != 2;
      }

      if (isNewCompletion) {
        completedHistory = await repository.fetchCompletedLessonsWithProgress(userId);
      }
    } catch (_) {
      // Fallback to true if we cannot check
    }

    await repository.upsertLessonProgress(
      userId: userId,
      lessonId: lessonId,
      status: 2, // Completed
      completedAt: DateTime.now().toUtc().toIso8601String(),
      bestAccuracy: accuracy,
      bestScore: score,
      xpEarned: xpEarned,
    );

    // Increment streak if it's a new completion
    if (isNewCompletion) {
      // Helper function to check if two dates are the same day (local time)
      bool isSameDay(DateTime a, DateTime b) {
        return a.year == b.year && a.month == b.month && a.day == b.day;
      }

      // Helper function to check if date a is yesterday relative to date b (local time)
      bool isYesterday(DateTime a, DateTime b) {
        final yesterday = b.subtract(const Duration(days: 1));
        return a.year == yesterday.year && a.month == yesterday.month && a.day == yesterday.day;
      }

      final currentStreak = await repository.fetchUserStreak(userId);
      int newStreak = currentStreak;

      if (completedHistory.isEmpty) {
        newStreak = 1;
      } else {
        final lastProg = completedHistory.first['progress'] as UserLessonProgressEntity;
        if (lastProg.completedAt != null && lastProg.completedAt!.isNotEmpty) {
          final lastCompletedLocal = DateTime.parse(lastProg.completedAt!).toLocal();
          final nowLocal = DateTime.now();

          if (isSameDay(lastCompletedLocal, nowLocal)) {
            // Already completed a lesson today, streak remains the same
            newStreak = currentStreak;
          } else if (isYesterday(lastCompletedLocal, nowLocal)) {
            // Completed yesterday, consecutive day: increment streak
            newStreak = currentStreak + 1;
          } else {
            // Streak broken: reset to 1
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      if (newStreak != currentStreak) {
        await repository.updateUserStreak(userId, newStreak);
      }
    }
  }
}
