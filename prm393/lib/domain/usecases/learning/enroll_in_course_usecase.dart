import '../../entities/enrollment_entity.dart';
import '../../repositories/learning_repository.dart';

class EnrollInCourseUseCase {
  final LearningRepository repository;

  EnrollInCourseUseCase(this.repository);

  Future<EnrollmentEntity> call(int userId, int courseId) {
    return repository.enrollInCourse(userId, courseId);
  }
}
