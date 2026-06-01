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

        // 1. Fetch lessons to compute lessonsCount dynamically
        List<dynamic> allLessons = [];
        try {
          final lessonsResponse = await _dioClient.dio.get(ApiConstants.lessons);
          if (lessonsResponse.statusCode == 200) {
            final lRaw = lessonsResponse.data;
            if (lRaw is List) {
              allLessons = lRaw;
            } else if (lRaw is Map) {
              allLessons = lRaw['items'] ?? lRaw['Items'] ?? lRaw['data'] ?? [];
            }
          }
        } catch (_) {}

        // 2. Fetch feedbacks and feedback categories to compute averageRating dynamically
        List<dynamic> allFeedbacks = [];
        int? courseCategoryId;
        try {
          final fbResponse = await _dioClient.dio.get("${ApiConstants.feedbacks}?pageSize=500");
          if (fbResponse.statusCode == 200) {
            final fbRaw = fbResponse.data;
            if (fbRaw is List) {
              allFeedbacks = fbRaw;
            } else if (fbRaw is Map) {
              allFeedbacks = fbRaw['items'] ?? fbRaw['Items'] ?? fbRaw['data'] ?? [];
            }
          }

          final catResponse = await _dioClient.dio.get("${ApiConstants.feedbackCategories}?pageSize=100");
          if (catResponse.statusCode == 200) {
            final catRaw = catResponse.data;
            List<dynamic> catsList = [];
            if (catRaw is List) {
              catsList = catRaw;
            } else if (catRaw is Map) {
              catsList = catRaw['items'] ?? catRaw['Items'] ?? catRaw['data'] ?? [];
            }
            final courseCat = catsList.firstWhere((c) => c['name']?.toString().toLowerCase() == 'course', orElse: () => null);
            if (courseCat != null) {
              courseCategoryId = courseCat['id'] as int?;
            }
          }
        } catch (_) {}

        return list.map((json) {
          final Map<String, dynamic> map = Map<String, dynamic>.from(json as Map);
          final int courseId = (map['id'] ?? 0) as int;

          // Compute lessons count
          final lessonsCount = allLessons.where((l) => (l['courseId'] ?? l['CourseId']) == courseId).length;
          map['lessonsCount'] = lessonsCount;
          map['LessonsCount'] = lessonsCount;

          // Compute average rating
          final courseFeedbacks = allFeedbacks.where((f) => 
            (f['categoryId'] ?? f['CategoryId']) == courseCategoryId && 
            (f['subject'] ?? f['Subject']) == 'CourseId:$courseId'
          ).toList();
          
          double avgRating = 0.0;
          if (courseFeedbacks.isNotEmpty) {
            final sum = courseFeedbacks.fold<double>(0.0, (prev, element) => prev + (element['rating'] ?? element['Rating'] ?? 0.0).toDouble());
            avgRating = double.parse((sum / courseFeedbacks.length).toStringAsFixed(1));
          }
          map['averageRating'] = avgRating;
          map['AverageRating'] = avgRating;

          return CourseModel.fromJson(map);
        }).toList();
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
        final Map<String, dynamic> map = Map<String, dynamic>.from(response.data as Map);

        // Fetch lessons count dynamically
        int lessonsCount = 0;
        try {
          final lessonsResponse = await _dioClient.dio.get(ApiConstants.lessons);
          if (lessonsResponse.statusCode == 200) {
            List<dynamic> allLessons = [];
            final lRaw = lessonsResponse.data;
            if (lRaw is List) {
              allLessons = lRaw;
            } else if (lRaw is Map) {
              allLessons = lRaw['items'] ?? lRaw['Items'] ?? lRaw['data'] ?? [];
            }
            lessonsCount = allLessons.where((l) => (l['courseId'] ?? l['CourseId']) == courseId).length;
          }
        } catch (_) {}
        map['lessonsCount'] = lessonsCount;
        map['LessonsCount'] = lessonsCount;

        // Fetch average rating dynamically
        double avgRating = 0.0;
        try {
          final fbResponse = await _dioClient.dio.get("${ApiConstants.feedbacks}?pageSize=500");
          if (fbResponse.statusCode == 200) {
            List<dynamic> allFeedbacks = [];
            final fbRaw = fbResponse.data;
            if (fbRaw is List) {
              allFeedbacks = fbRaw;
            } else if (fbRaw is Map) {
              allFeedbacks = fbRaw['items'] ?? fbRaw['Items'] ?? fbRaw['data'] ?? [];
            }

            final catResponse = await _dioClient.dio.get("${ApiConstants.feedbackCategories}?pageSize=100");
            int? courseCategoryId;
            if (catResponse.statusCode == 200) {
              List<dynamic> catsList = [];
              final catRaw = catResponse.data;
              if (catRaw is List) {
                catsList = catRaw;
              } else if (catRaw is Map) {
                catsList = catRaw['items'] ?? catRaw['Items'] ?? catRaw['data'] ?? [];
              }
              final courseCat = catsList.firstWhere((c) => c['name']?.toString().toLowerCase() == 'course', orElse: () => null);
              if (courseCat != null) {
                courseCategoryId = courseCat['id'] as int?;
              }
            }

            final courseFeedbacks = allFeedbacks.where((f) => 
              (f['categoryId'] ?? f['CategoryId']) == courseCategoryId && 
              (f['subject'] ?? f['Subject']) == 'CourseId:$courseId'
            ).toList();
            
            if (courseFeedbacks.isNotEmpty) {
              final sum = courseFeedbacks.fold<double>(0.0, (prev, element) => prev + (element['rating'] ?? element['Rating'] ?? 0.0).toDouble());
              avgRating = double.parse((sum / courseFeedbacks.length).toStringAsFixed(1));
            }
          }
        } catch (_) {}
        map['averageRating'] = avgRating;
        map['AverageRating'] = avgRating;

        return CourseModel.fromJson(map);
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

  Future<List<dynamic>> getFeedbacks() async {
    try {
      final response = await _dioClient.dio.get("${ApiConstants.feedbacks}?pageSize=500");
      if (response.statusCode == 200) {
        final rawData = response.data;
        if (rawData is List) {
          return rawData;
        } else if (rawData is Map) {
          final items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? [];
          if (items is List) {
            return items;
          }
        }
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<dynamic>> getFeedbackCategories() async {
    try {
      final response = await _dioClient.dio.get("${ApiConstants.feedbackCategories}?pageSize=100");
      if (response.statusCode == 200) {
        final rawData = response.data;
        if (rawData is List) {
          return rawData;
        } else if (rawData is Map) {
          final items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? [];
          if (items is List) {
            return items;
          }
        }
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<bool> submitFeedback({
    required int userId,
    required int categoryId,
    required int rating,
    required String subject,
    required String content,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.feedbacks,
        data: {
          'userId': userId,
          'categoryId': categoryId,
          'rating': rating,
          'subject': subject,
          'content': content,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  Future<String?> getVideoUrl(int mediaId) async {
    try {
      final response = await _dioClient.dio.get("${ApiConstants.baseUrl}/api/media_assets/$mediaId");
      if (response.statusCode == 200) {
        final data = response.data;
        return (data['fileUrl'] ?? data['FileUrl']) as String?;
      }
    } catch (_) {}
    return null;
  }
}
