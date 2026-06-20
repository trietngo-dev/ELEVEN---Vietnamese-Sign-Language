import '../../entities/lesson_entity.dart';
import '../../repositories/learning_repository.dart';

class LoadLessonDetailsUseCase {
  final LearningRepository repository;

  LoadLessonDetailsUseCase(this.repository);

  Future<LessonEntity> call(int lessonId) {
    return repository.fetchLessonDetails(lessonId);
  }
}
