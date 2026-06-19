import '../../entities/course_category_entity.dart';
import '../../entities/course_entity.dart';
import '../../entities/enrollment_entity.dart';
import '../../entities/lesson_entity.dart';
import '../../repositories/learning_repository.dart';

class CatalogData {
  final List<CourseCategoryEntity> categories;
  final List<CourseEntity> courses;
  final List<EnrollmentEntity> enrollments;
  final List<LessonEntity> allLessons;
  final int streakDays;

  CatalogData({
    required this.categories,
    required this.courses,
    required this.enrollments,
    required this.allLessons,
    required this.streakDays,
  });
}

class LoadCatalogUseCase {
  final LearningRepository repository;

  LoadCatalogUseCase(this.repository);

  Future<CatalogData> call(int userId) async {
    final categories = await repository.fetchCategories();
    final courses = await repository.fetchCourses();
    final enrollments = await repository.fetchUserEnrollments(userId);
    final allLessons = await repository.fetchLessons();
    final streakDays = await repository.fetchUserStreak(userId);

    return CatalogData(
      categories: categories,
      courses: courses,
      enrollments: enrollments,
      allLessons: allLessons,
      streakDays: streakDays,
    );
  }
}
