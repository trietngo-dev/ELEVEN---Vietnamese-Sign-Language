import '../../domain/repositories/gesture_repository.dart';
import '../datasources/gesture_data_source.dart';

class GestureRepositoryImpl implements GestureRepository {
  final GestureDataSource remoteDataSource;

  GestureRepositoryImpl(this.remoteDataSource);

  @override
  Future<Map<String, dynamic>> predictGesture(List<double> features) {
    return remoteDataSource.predictGesture(features);
  }

  @override
  Future<String> translateSentence(List<String> words) {
    return remoteDataSource.translateSentence(words);
  }
}
