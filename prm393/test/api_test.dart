import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:vietnamese_sign_language_platform/data/models/lesson_model.dart';

void main() {
  test('Query real backend API for lessons', () async {
    final dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:5000',
    ));
    
    // Login as standard user or admin to get token
    print('Logging in to backend...');
    final loginRes = await dio.post('/api/users/login', data: {
      'email': 'admin@exe101.local',
      'password': 'Admin@123',
    });
    
    final token = loginRes.data['accessToken'];
    print('Token: $token');
    
    dio.options.headers['Authorization'] = 'Bearer $token';
    
    print('Fetching lessons...');
    final response = await dio.get('/api/lessons', queryParameters: {
      'page': 1,
      'pageSize': 200,
    });
    
    print('Response status: ${response.statusCode}');
    final items = response.data['items'] as List<dynamic>;
    print('Total items from API: ${items.length}');
    
    final lessons = items.map((e) => LessonModel.fromJson(e as Map<String, dynamic>)).toList();
    print('Parsed ${lessons.length} lessons.');
    for (var l in lessons) {
      print('ID: ${l.id}, Title: ${l.title}, CourseID: ${l.courseId}, SortOrder: ${l.sortOrder}');
    }
  });
}
