import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';

class GestureDataSource {
  final DioClient _dioClient;

  GestureDataSource(this._dioClient);

  Future<Map<String, dynamic>> predictGesture(List<double> features) async {
    try {
      final response = await _dioClient.dio.post(
        "${ApiConstants.baseUrl}/api/gesture/predict",
        data: {
          'features': features,
        },
      );

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Dự đoán cử chỉ thất bại.');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ nhận diện cử chỉ.');
    }
  }

  Future<String> translateSentence(List<String> words) async {
    try {
      final response = await _dioClient.dio.post(
        "${ApiConstants.baseUrl}/api/gesture/translate-sentence",
        data: {
          'words': words,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        return (data['sentence'] ?? '') as String;
      }
      throw Exception('Trau chuốt câu dịch cử chỉ thất bại.');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ dịch thuật.');
    }
  }
}
