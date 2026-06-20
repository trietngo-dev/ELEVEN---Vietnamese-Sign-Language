import '../../repositories/gesture_repository.dart';

class TranslateSentenceUseCase {
  final GestureRepository repository;

  TranslateSentenceUseCase(this.repository);

  Future<String> call(List<String> words) {
    return repository.translateSentence(words);
  }
}
