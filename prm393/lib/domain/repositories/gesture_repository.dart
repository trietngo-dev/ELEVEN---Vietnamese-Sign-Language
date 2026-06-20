abstract class GestureRepository {
  Future<Map<String, dynamic>> predictGesture(List<double> features);
  Future<String> translateSentence(List<String> words);
}
