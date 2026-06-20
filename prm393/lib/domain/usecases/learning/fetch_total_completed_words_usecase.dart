import '../../repositories/learning_repository.dart';

class FetchTotalCompletedWordsUseCase {
  final LearningRepository repository;

  FetchTotalCompletedWordsUseCase(this.repository);

  Future<int> call(int userId) {
    return repository.fetchTotalCompletedWords(userId);
  }
}
