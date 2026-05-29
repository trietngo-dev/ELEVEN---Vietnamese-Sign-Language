import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/course_model.dart';
import '../models/lesson_model.dart';

class CourseDataSource {
  final DioClient _dioClient;

  CourseDataSource(this._dioClient);

  Future<List<CourseModel>> getCourses() async {
    try {
      final response = await _dioClient.dio.get(ApiConstants.courses);
      if (response.statusCode == 200) {
        final rawData = response.data;
        List<dynamic> list = [];
        if (rawData is List) {
          list = rawData;
        } else if (rawData is Map) {
          final items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? rawData['results'] ?? [];
          if (items is List) {
            list = items;
          }
        }
        return list.map((json) => CourseModel.fromJson(json as Map<String, dynamic>)).toList();
      }
      throw Exception('Không thể lấy danh sách khóa học.');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ khi lấy khóa học.');
    }
  }

  Future<CourseModel> getCourseDetail(int courseId) async {
    try {
      final response = await _dioClient.dio.get("${ApiConstants.courses}/$courseId");
      if (response.statusCode == 200) {
        return CourseModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw Exception('Không thể lấy chi tiết khóa học.');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.');
    }
  }

  Future<List<LessonModel>> getLessons(int courseId) async {
    try {
      final response = await _dioClient.dio.get(ApiConstants.lessons);
      if (response.statusCode == 200) {
        final rawData = response.data;
        List<dynamic> list = [];
        if (rawData is List) {
          list = rawData;
        } else if (rawData is Map) {
          final items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? rawData['results'] ?? [];
          if (items is List) {
            list = items;
          }
        }
        // Filter lessons by courseId locally just like the web app
        return list
            .map((json) => LessonModel.fromJson(json as Map<String, dynamic>))
            .where((lesson) => lesson.courseId == courseId)
            .toList()
          ..sort((a, b) => a.orderIndex.compareTo(b.orderIndex));
      }
      throw Exception('Không thể lấy danh sách bài học.');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.');
    }
  }

  Future<List<dynamic>> getUserLessonProgress() async {
    try {
      final response = await _dioClient.dio.get(ApiConstants.userNotifications.replaceAll('/notifications/user', '/user_lesson_progress'));
      if (response.statusCode == 200) {
        return response.data as List<dynamic>;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<bool> completeLesson({
    required int userId,
    required int lessonId,
    required double accuracy,
    required int xpEarned,
  }) async {
    try {
      final endpoint = "${ApiConstants.baseUrl}/api/user_lesson_progress/upsert";
      final response = await _dioClient.dio.post(
        endpoint,
        data: {
          'userId': userId,
          'lessonId': lessonId,
          'status': 2, // Completed
          'startedAt': DateTime.now().toUtc().toIso8601String(),
          'completedAt': DateTime.now().toUtc().toIso8601String(),
          'lastPositionSeconds': 0,
          'attemptsCount': 1,
          'bestAccuracy': accuracy,
          'bestScore': accuracy,
          'totalTimeSeconds': 300,
          'xpEarned': xpEarned,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } on DioException catch (_) {
      return false;
    }
  }
}
