import '../../entities/enrollment_entity.dart';
import '../../entities/lesson_entity.dart';
import '../../entities/user_lesson_progress_entity.dart';
import '../../repositories/learning_repository.dart';

class CourseDetailsData {
  final List<LessonEntity> courseLessons;
  final List<UserLessonProgressEntity> progress;
  final List<EnrollmentEntity> enrollments;
  final int streakDays;

  CourseDetailsData({
    required this.courseLessons,
    required this.progress,
    required this.enrollments,
    required this.streakDays,
  });
}

class LoadCourseDetailsUseCase {
  final LearningRepository repository;

  LoadCourseDetailsUseCase(this.repository);

  Future<CourseDetailsData> call(int userId, int courseId) async {
    final allLessons = await repository.fetchLessons();
    final courseLessons = allLessons.where((l) => l.courseId == courseId).toList();
    courseLessons.sort((a, b) => a.sortOrder.compareTo(b.sortOrder));

    final progress = await repository.fetchUserProgress(userId, courseId);
    final enrollments = await repository.fetchUserEnrollments(userId);
    final streakDays = await repository.fetchUserStreak(userId);

    return CourseDetailsData(
      courseLessons: courseLessons,
      progress: progress,
      enrollments: enrollments,
      streakDays: streakDays,
    );
  }
}
