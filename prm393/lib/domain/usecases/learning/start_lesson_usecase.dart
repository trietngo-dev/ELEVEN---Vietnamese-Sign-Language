import '../../repositories/learning_repository.dart';

class StartLessonUseCase {
  final LearningRepository repository;

  StartLessonUseCase(this.repository);

  Future<void> call(int userId, int lessonId) {
    return repository.upsertLessonProgress(
      userId: userId,
      lessonId: lessonId,
      status: 1, // InProgress
    );
  }
}
