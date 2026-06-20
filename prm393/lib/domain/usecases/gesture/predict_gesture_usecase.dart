import '../../repositories/gesture_repository.dart';

class PredictGestureUseCase {
  final GestureRepository repository;

  PredictGestureUseCase(this.repository);

  Future<Map<String, dynamic>> call(List<double> features) {
    return repository.predictGesture(features);
  }
}
