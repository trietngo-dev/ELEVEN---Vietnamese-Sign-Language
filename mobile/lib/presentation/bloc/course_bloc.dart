import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/datasources/course_data_source.dart';
import '../../data/models/course_model.dart';
import '../../data/models/lesson_model.dart';

// --- Events ---
abstract class CourseEvent {}

class LoadCoursesRequested extends CourseEvent {}

class LoadCourseDetailRequested extends CourseEvent {
  final int courseId;
  LoadCourseDetailRequested(this.courseId);
}

// --- States ---
abstract class CourseState {}

class CourseInitial extends CourseState {}

class CourseLoading extends CourseState {}

class CoursesLoadSuccess extends CourseState {
  final List<CourseModel> courses;
  CoursesLoadSuccess(this.courses);
}

class CourseDetailLoadSuccess extends CourseState {
  final CourseModel course;
  final List<LessonModel> lessons;
  CourseDetailLoadSuccess(this.course, this.lessons);
}

class CourseFailure extends CourseState {
  final String error;
  CourseFailure(this.error);
}

// --- Bloc ---
class CourseBloc extends Bloc<CourseEvent, CourseState> {
  final CourseDataSource _courseDataSource;

  CourseBloc(this._courseDataSource) : super(CourseInitial()) {
    on<LoadCoursesRequested>((event, emit) async {
      emit(CourseLoading());
      try {
        final courses = await _courseDataSource.getCourses();
        emit(CoursesLoadSuccess(courses));
      } catch (e) {
        emit(CourseFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<LoadCourseDetailRequested>((event, emit) async {
      emit(CourseLoading());
      try {
        final course = await _courseDataSource.getCourseDetail(event.courseId);
        final lessons = await _courseDataSource.getLessons(event.courseId);
        emit(CourseDetailLoadSuccess(course, lessons));
      } catch (e) {
        emit(CourseFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });
  }
}
