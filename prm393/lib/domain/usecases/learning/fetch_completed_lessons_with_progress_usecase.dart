import '../../repositories/learning_repository.dart';

class FetchCompletedLessonsWithProgressUseCase {
  final LearningRepository repository;

  FetchCompletedLessonsWithProgressUseCase(this.repository);

  Future<List<Map<String, dynamic>>> call(int userId) {
    return repository.fetchCompletedLessonsWithProgress(userId);
  }
}
