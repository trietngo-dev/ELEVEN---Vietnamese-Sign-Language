import '../../repositories/learning_repository.dart';

class FetchUserStreakUseCase {
  final LearningRepository repository;

  FetchUserStreakUseCase(this.repository);

  Future<int> call(int userId) {
    return repository.fetchUserStreak(userId);
  }
}
