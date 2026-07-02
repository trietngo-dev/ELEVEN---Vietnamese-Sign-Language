import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/course_model.dart';
import '../models/lesson_model.dart';
import '../../core/utils/error_handler.dart';

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
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi kết nối máy chủ khi lấy khóa học.'));
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
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi kết nối máy chủ.'));
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
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi kết nối máy chủ.'));
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

  // 16. Get bookmarked lesson IDs from backend user_vocabulary_progress
  Future<List<int>> getBookmarkedLessonIds(int userId) async {
    try {
      final progressRes = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/user_vocabulary_progress?pageSize=1000');
      if (progressRes.statusCode != 200) return [];
      final pData = progressRes.data;
      List<dynamic> pItems = [];
      if (pData is List) {
        pItems = pData;
      } else if (pData is Map) {
        pItems = pData['items'] ?? pData['Items'] ?? pData['data'] ?? [];
      }

      final userSaved = pItems.where((p) => 
        (p['userId'] ?? p['UserId']) == userId && 
        (p['isSaved'] ?? p['IsSaved'] ?? false) == true
      ).toList();

      if (userSaved.isEmpty) return [];

      final lvRes = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/lesson_vocabularies?pageSize=1000');
      if (lvRes.statusCode != 200) return [];
      final lvData = lvRes.data;
      List<dynamic> lvItems = [];
      if (lvData is List) {
        lvItems = lvData;
      } else if (lvData is Map) {
        lvItems = lvData['items'] ?? lvData['Items'] ?? lvData['data'] ?? [];
      }

      final List<int> savedLessonIds = [];
      for (var p in userSaved) {
        final int vocabId = (p['vocabularyId'] ?? p['VocabularyId'] ?? 0) as int;
        final mapping = lvItems.firstWhere(
          (lv) => (lv['vocabularyId'] ?? lv['VocabularyId']) == vocabId,
          orElse: () => null,
        );
        if (mapping != null) {
          final int lessonId = (mapping['lessonId'] ?? mapping['LessonId'] ?? 0) as int;
          if (lessonId > 0) {
            savedLessonIds.add(lessonId);
          }
        }
      }
      return savedLessonIds;
    } catch (_) {
      return [];
    }
  }

  // 17. Toggle bookmark on backend
  Future<bool> toggleBookmark(int userId, int lessonId, String lessonTitle, String? lessonDescription) async {
    try {
      final lvRes = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/lesson_vocabularies?pageSize=1000');
      if (lvRes.statusCode != 200) return false;
      final lvData = lvRes.data;
      List<dynamic> lvItems = [];
      if (lvData is List) {
        lvItems = lvData;
      } else if (lvData is Map) {
        lvItems = lvData['items'] ?? lvData['Items'] ?? lvData['data'] ?? [];
      }

      final mapping = lvItems.firstWhere(
        (lv) => (lv['lessonId'] ?? lv['LessonId']) == lessonId,
        orElse: () => null,
      );

      int vocabId = 0;
      if (mapping == null) {
        final vocabRes = await _dioClient.dio.post(
          '${ApiConstants.baseUrl}/api/vocabularies',
          data: {
            'categoryId': 1,
            'code': 'lesson_$lessonId',
            'termVi': lessonTitle,
            'description': lessonDescription ?? 'Từ vựng chung',
            'difficultyLevel': 'Cơ bản',
            'isFeatured': false,
            'createdBy': userId,
          },
        );
        if (vocabRes.statusCode != 200 && vocabRes.statusCode != 201) return false;
        vocabId = (vocabRes.data['id'] ?? vocabRes.data['Id'] ?? 0) as int;

        final mapRes = await _dioClient.dio.post(
          '${ApiConstants.baseUrl}/api/lesson_vocabularies',
          data: {
            'lessonId': lessonId,
            'vocabularyId': vocabId,
            'sortOrder': 1,
            'isRequired': true,
            'expectedAccuracy': 80,
          },
        );
        if (mapRes.statusCode != 200 && mapRes.statusCode != 201) return false;
      } else {
        vocabId = (mapping['vocabularyId'] ?? mapping['VocabularyId']) as int;
      }

      final progressRes = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/user_vocabulary_progress?pageSize=1000');
      if (progressRes.statusCode != 200) return false;
      final pData = progressRes.data;
      List<dynamic> pItems = [];
      if (pData is List) {
        pItems = pData;
      } else if (pData is Map) {
        pItems = pData['items'] ?? pData['Items'] ?? pData['data'] ?? [];
      }

      final existingProgress = pItems.firstWhere(
        (p) => (p['userId'] ?? p['UserId']) == userId && (p['vocabularyId'] ?? p['VocabularyId']) == vocabId,
        orElse: () => null,
      );

      if (existingProgress == null) {
        final createRes = await _dioClient.dio.post(
          '${ApiConstants.baseUrl}/api/user_vocabulary_progress',
          data: {
            'userId': userId,
            'vocabularyId': vocabId,
            'status': 0,
            'isSaved': true,
          },
        );
        return createRes.statusCode == 200 || createRes.statusCode == 201;
      } else {
        final int progressId = (existingProgress['id'] ?? existingProgress['Id']) as int;
        final bool currentSaved = (existingProgress['isSaved'] ?? existingProgress['IsSaved'] ?? false) as bool;
        final updateRes = await _dioClient.dio.put(
          '${ApiConstants.baseUrl}/api/user_vocabulary_progress/$progressId',
          data: {
            'status': existingProgress['status'] ?? existingProgress['Status'] ?? 0,
            'firstLearnedAt': existingProgress['firstLearnedAt'] ?? existingProgress['FirstLearnedAt'],
            'lastPracticedAt': existingProgress['lastPracticedAt'] ?? existingProgress['LastPracticedAt'],
            'masteryLevel': existingProgress['masteryLevel'] ?? existingProgress['MasteryLevel'] ?? 0,
            'totalPracticeCount': existingProgress['totalPracticeCount'] ?? existingProgress['TotalPracticeCount'] ?? 0,
            'correctCount': existingProgress['correctCount'] ?? existingProgress['CorrectCount'] ?? 0,
            'bestConfidence': existingProgress['bestConfidence'] ?? existingProgress['BestConfidence'] ?? 0,
            'isSaved': !currentSaved,
          },
        );
        return updateRes.statusCode == 200 || updateRes.statusCode == 204;
      }
    } catch (_) {
      return false;
    }
  }
}
