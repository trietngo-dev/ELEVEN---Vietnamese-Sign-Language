import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/learning/load_catalog_usecase.dart';
import '../../../domain/usecases/learning/load_course_details_usecase.dart';
import '../../../domain/usecases/learning/load_lesson_details_usecase.dart';
import '../../../domain/usecases/learning/start_lesson_usecase.dart';
import '../../../domain/usecases/learning/complete_lesson_usecase.dart';
import '../../../domain/usecases/learning/enroll_in_course_usecase.dart';
import 'learning_state.dart';

class LearningCubit extends Cubit<LearningState> {
  final LoadCatalogUseCase loadCatalogUseCase;
  final LoadCourseDetailsUseCase loadCourseDetailsUseCase;
  final LoadLessonDetailsUseCase loadLessonDetailsUseCase;
  final StartLessonUseCase startLessonUseCase;
  final CompleteLessonUseCase completeLessonUseCase;
  final EnrollInCourseUseCase enrollInCourseUseCase;

  LearningCubit({
    required this.loadCatalogUseCase,
    required this.loadCourseDetailsUseCase,
    required this.loadLessonDetailsUseCase,
    required this.startLessonUseCase,
    required this.completeLessonUseCase,
    required this.enrollInCourseUseCase,
  }) : super(LearningState());

  Future<void> loadCatalog(int userId) async {
    emit(state.copyWith(isLoading: true));
    try {
      final catalogData = await loadCatalogUseCase(userId);

      emit(state.copyWith(
        isLoading: false,
        categories: catalogData.categories,
        courses: catalogData.courses,
        enrollments: catalogData.enrollments,
        allLessons: catalogData.allLessons,
        streakDays: catalogData.streakDays,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> loadCourseDetails(int userId, int courseId) async {
    emit(state.copyWith(isLoading: true));
    try {
      final courseDetailsData = await loadCourseDetailsUseCase(userId, courseId);

      emit(state.copyWith(
        isLoading: false,
        currentCourseLessons: courseDetailsData.courseLessons,
        currentCourseProgress: courseDetailsData.progress,
        enrollments: courseDetailsData.enrollments,
        streakDays: courseDetailsData.streakDays,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> loadLessonDetails(int lessonId) async {
    emit(state.copyWith(isLoading: true));
    try {
      final lessonDetails = await loadLessonDetailsUseCase(lessonId);
      emit(state.copyWith(
        isLoading: false,
        activeLesson: lessonDetails,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> startLesson(int userId, int lessonId) async {
    try {
      await startLessonUseCase(userId, lessonId);
    } catch (e) {
      // Fail silently in background
    }
  }

  Future<void> completeLesson({
    required int userId,
    required int lessonId,
    required int courseId,
    double accuracy = 0.0,
    double score = 0.0,
    int xpEarned = 50,
  }) async {
    emit(state.copyWith(isLoading: true));
    try {
      // Complete lesson using use case, which encapsulates the entire streak calculation logic
      await completeLessonUseCase(
        userId: userId,
        lessonId: lessonId,
        courseId: courseId,
        accuracy: accuracy,
        score: score,
        xpEarned: xpEarned,
      );

      // Reload the current details to update state
      final courseDetailsData = await loadCourseDetailsUseCase(userId, courseId);

      emit(state.copyWith(
        isLoading: false,
        enrollments: courseDetailsData.enrollments,
        currentCourseProgress: courseDetailsData.progress,
        streakDays: courseDetailsData.streakDays,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> enrollInCourse(int userId, int courseId) async {
    emit(state.copyWith(isLoading: true));
    try {
      await enrollInCourseUseCase(userId, courseId);
      
      // Reload details or catalog to refresh enrollments
      final catalogData = await loadCatalogUseCase(userId);
      
      emit(state.copyWith(
        isLoading: false,
        enrollments: catalogData.enrollments,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }
}
