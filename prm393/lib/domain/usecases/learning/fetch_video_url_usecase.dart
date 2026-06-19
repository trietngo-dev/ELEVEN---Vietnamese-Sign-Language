import '../../repositories/learning_repository.dart';

class FetchVideoUrlUseCase {
  final LearningRepository repository;

  FetchVideoUrlUseCase(this.repository);

  Future<String?> call(int mediaId) {
    return repository.fetchVideoUrl(mediaId);
  }
}
