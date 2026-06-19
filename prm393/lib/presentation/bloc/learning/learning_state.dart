import '../../../domain/entities/course_category_entity.dart';
import '../../../domain/entities/course_entity.dart';
import '../../../domain/entities/lesson_entity.dart';
import '../../../domain/entities/user_lesson_progress_entity.dart';
import '../../../domain/entities/enrollment_entity.dart';

class LearningState {
  final bool isLoading;
  final String? errorMessage;
  final List<CourseCategoryEntity> categories;
  final List<CourseEntity> courses;
  final List<EnrollmentEntity> enrollments;
  final List<LessonEntity> allLessons;
  final List<LessonEntity> currentCourseLessons;
  final List<UserLessonProgressEntity> currentCourseProgress;
  final LessonEntity? activeLesson;
  final int streakDays;

  LearningState({
    this.isLoading = false,
    this.errorMessage,
    this.categories = const [],
    this.courses = const [],
    this.enrollments = const [],
    this.allLessons = const [],
    this.currentCourseLessons = const [],
    this.currentCourseProgress = const [],
    this.activeLesson,
    this.streakDays = 0,
  });

  LearningState copyWith({
    bool? isLoading,
    String? errorMessage,
    List<CourseCategoryEntity>? categories,
    List<CourseEntity>? courses,
    List<EnrollmentEntity>? enrollments,
    List<LessonEntity>? allLessons,
    List<LessonEntity>? currentCourseLessons,
    List<UserLessonProgressEntity>? currentCourseProgress,
    LessonEntity? activeLesson,
    int? streakDays,
  }) {
    return LearningState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      categories: categories ?? this.categories,
      courses: courses ?? this.courses,
      enrollments: enrollments ?? this.enrollments,
      allLessons: allLessons ?? this.allLessons,
      currentCourseLessons: currentCourseLessons ?? this.currentCourseLessons,
      currentCourseProgress: currentCourseProgress ?? this.currentCourseProgress,
      activeLesson: activeLesson ?? this.activeLesson,
      streakDays: streakDays ?? this.streakDays,
    );
  }
}
