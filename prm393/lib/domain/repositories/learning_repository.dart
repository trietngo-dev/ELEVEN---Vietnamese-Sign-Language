import '../entities/course_category_entity.dart';
import '../entities/course_entity.dart';
import '../entities/enrollment_entity.dart';
import '../entities/lesson_entity.dart';
import '../entities/user_lesson_progress_entity.dart';

abstract class LearningRepository {
  Future<List<CourseCategoryEntity>> fetchCategories();
  Future<List<CourseEntity>> fetchCourses();
  Future<List<LessonEntity>> fetchLessons();
  Future<LessonEntity> fetchLessonDetails(int lessonId);
  Future<List<EnrollmentEntity>> fetchUserEnrollments(int userId);
  Future<List<UserLessonProgressEntity>> fetchUserProgress(int userId, int courseId);
  Future<UserLessonProgressEntity> upsertLessonProgress({
    required int userId,
    required int lessonId,
    required int status, // 0 = NotStarted, 1 = InProgress, 2 = Completed
    String? startedAt,
    String? completedAt,
    int lastPositionSeconds = 0,
    int attemptsCount = 1,
    double bestAccuracy = 0.0,
    double bestScore = 0.0,
    int totalTimeSeconds = 0,
    int xpEarned = 0,
  });
  Future<EnrollmentEntity> enrollInCourse(int userId, int courseId);
  Future<String?> fetchVideoUrl(int mediaId);
  Future<int> fetchUserStreak(int userId);
  Future<int> fetchTotalCompletedWords(int userId);
  Future<void> updateUserStreak(int userId, int newStreak);
  Future<List<Map<String, dynamic>>> fetchCompletedLessonsWithProgress(int userId);
}
