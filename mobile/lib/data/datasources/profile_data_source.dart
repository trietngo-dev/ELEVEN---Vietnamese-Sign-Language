import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/avatar_frame_model.dart';
import '../models/badge_model.dart';
import '../models/notification_model.dart';
import '../../core/utils/error_handler.dart';

class ProfileDataSource {
  final DioClient _dioClient;

  ProfileDataSource(this._dioClient);

  // 1. Fetch User Profile
  Future<Map<String, dynamic>> getUserProfile(int userId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/user_profiles/$userId');
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể tải thông tin hồ sơ.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi kết nối máy chủ khi lấy hồ sơ.'));
    }
  }

  // 2. Update User Profile (gender, bio, activeFrameId, preferredSignVariant)
  Future<Map<String, dynamic>> updateUserProfile(int userId, Map<String, dynamic> data) async {
    try {
      final response = await _dioClient.dio.put('${ApiConstants.baseUrl}/api/user_profiles/$userId', data: data);
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể cập nhật hồ sơ.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi cập nhật hồ sơ.'));
    }
  }

  // 3. Add XP (for testing)
  Future<Map<String, dynamic>> addXp(int userId, int xpToAdd) async {
    try {
      final response = await _dioClient.dio.post(
        '${ApiConstants.baseUrl}/api/user_profiles/$userId/add-xp',
        data: {'xpToAdd': xpToAdd},
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể cộng XP.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi khi cộng XP.'));
    }
  }

  // 4. Get all active avatar frames
  Future<List<AvatarFrameModel>> getAvatarFrames() async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/avatar-frames');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((json) => AvatarFrameModel.fromJson(json as Map<String, dynamic>)).toList();
      }
      throw Exception('Không thể tải danh sách khung ảnh.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi tải danh sách khung ảnh.'));
    }
  }

  // 5. Get owned avatar frames
  Future<List<AvatarFrameModel>> getOwnedAvatarFrames() async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/avatar-frames/my');
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((json) => AvatarFrameModel.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  // 6. Redeem avatar frame
  Future<Map<String, dynamic>> redeemAvatarFrame(int frameId) async {
    try {
      final response = await _dioClient.dio.post('${ApiConstants.baseUrl}/api/avatar-frames/$frameId/redeem');
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Giao dịch đổi khung không thành công.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi khi đổi khung ảnh.'));
    }
  }

  // 7. Equip avatar frame
  Future<Map<String, dynamic>> equipAvatarFrame(int? frameId) async {
    try {
      final response = await _dioClient.dio.patch(
        '${ApiConstants.baseUrl}/api/avatar-frames/equip',
        data: {'frameId': frameId},
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể trang bị khung ảnh.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi khi trang bị khung ảnh.'));
    }
  }

  // 8. Fetch user notifications (filtered locally by user id)
  Future<List<NotificationModel>> getUserNotifications(int userId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/notifications?page=1&pageSize=100');
      if (response.statusCode == 200) {
        final rawData = response.data;
        List<dynamic> items = [];
        if (rawData is List) {
          items = rawData;
        } else if (rawData is Map) {
          items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? [];
        }
        return items
            .map((json) => NotificationModel.fromJson(json as Map<String, dynamic>))
            .where((n) => n.userId == userId)
            .toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  // 9. Update notification (mark as read)
  Future<bool> markNotificationAsRead(int notificationId, Map<String, dynamic> body) async {
    try {
      final response = await _dioClient.dio.put('${ApiConstants.baseUrl}/api/notifications/$notificationId', data: body);
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // 10. Delete notification
  Future<bool> deleteNotification(int notificationId) async {
    try {
      final response = await _dioClient.dio.delete('${ApiConstants.baseUrl}/api/notifications/$notificationId');
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (_) {
      return false;
    }
  }

  // 11. Fetch master badges list
  Future<List<BadgeModel>> getBadges() async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/badges?page=1&pageSize=100');
      if (response.statusCode == 200) {
        final rawData = response.data;
        List<dynamic> items = [];
        if (rawData is List) {
          items = rawData;
        } else if (rawData is Map) {
          items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? [];
        }
        return items.map((json) => BadgeModel.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  // 12. Fetch user-earned badges (check-and-award first)
  Future<List<BadgeModel>> getUserEarnedBadges() async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/user_badges?page=1&pageSize=100');
      if (response.statusCode == 200) {
        final rawData = response.data;
        List<dynamic> items = [];
        if (rawData is List) {
          items = rawData;
        } else if (rawData is Map) {
          items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? [];
        }
        
        // Match user earned badges to get full details
        final masterBadges = await getBadges();
        final List<BadgeModel> earned = [];
        for (var item in items) {
          final int badgeId = (item['badgeId'] ?? item['BadgeId'] ?? 0) as int;
          final matched = masterBadges.firstWhere((b) => b.id == badgeId, orElse: () => BadgeModel(id: badgeId, code: 'UNKNOWN', name: 'Huy hiệu', description: ''));
          if (matched.code != 'UNKNOWN') {
            earned.add(matched);
          }
        }
        return earned;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  // 13. Get User Details (contain avatarMediaId, email)
  Future<Map<String, dynamic>> getUserDetails(int userId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/users/$userId');
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể lấy chi tiết tài khoản.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi lấy thông tin tài khoản.'));
    }
  }

  // 14. Get Media Asset Details (contain fileUrl)
  Future<Map<String, dynamic>> getMediaAsset(int mediaId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/media_assets/$mediaId');
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể tải tệp tin đa phương tiện.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi tải tệp tin.'));
    }
  }

  // 15. Upload real avatar image
  Future<Map<String, dynamic>> uploadAvatar(String filePath) async {
    try {
      final String fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          filePath,
          filename: fileName,
        ),
      });
      final response = await _dioClient.dio.post(
        '${ApiConstants.baseUrl}/api/media_assets/upload',
        data: formData,
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Tải ảnh đại diện thất bại.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi tải ảnh đại diện lên máy chủ.'));
    }
  }

  // 16. Update user avatar media ID
  Future<Map<String, dynamic>> updateUserAvatar(int userId, int mediaId) async {
    try {
      final response = await _dioClient.dio.patch(
        '${ApiConstants.baseUrl}/api/users/$userId/avatar',
        data: {'avatarMediaId': mediaId},
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Cập nhật ảnh đại diện thất bại.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi cập nhật ảnh đại diện.'));
    }
  }

  // 17. Download preset avatar and upload to server, returning mediaId
  Future<int> uploadPresetFromUrl(String url) async {
    try {
      final response = await _dioClient.dio.get<List<int>>(
        url,
        options: Options(responseType: ResponseType.bytes),
      );
      final bytes = response.data!;
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          bytes,
          filename: 'avatar_preset.png',
          contentType: DioMediaType('image', 'png'),
        ),

      });
      final uploadResponse = await _dioClient.dio.post(
        '${ApiConstants.baseUrl}/api/media_assets/upload',
        data: formData,
      );
      if (uploadResponse.statusCode == 200 || uploadResponse.statusCode == 201) {
        return (uploadResponse.data['id'] ?? uploadResponse.data['Id']) as int;
      }
      throw Exception('Không thể tải preset lên server.');
    } catch (e) {
      throw Exception('Lỗi chuyển đổi preset: $e');
    }
  }

  // 18. Fetch dynamic subscription plans
  Future<List<Map<String, dynamic>>> getSubscriptionPlans() async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/subscription_plans?page=1&pageSize=100');
      if (response.statusCode == 200) {
        final rawData = response.data;
        List<dynamic> items = [];
        if (rawData is List) {
          items = rawData;
        } else if (rawData is Map) {
          items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? [];
        }
        return items.map((json) => json as Map<String, dynamic>).toList();
      }
      throw Exception('Không thể tải các gói dịch vụ.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi kết nối khi tải các gói dịch vụ.'));
    }
  }

  // 19. Post login activity log to sync streak count
  Future<void> postLoginActivityLog(int userId) async {
    try {
      await _dioClient.dio.post(
        '${ApiConstants.baseUrl}/api/user_activity_logs',
        data: {
          'userId': userId,
          'actionType': 'login',
          'entityType': 'user',
          'entityId': userId,
          'metadataJson': '{}',
        },
      );
    } catch (_) {
      // Fail silently to prevent login blocking on connectivity blips
    }
  }

  // 20. Update User Details (Full Name, Role, Email, Avatar, Status)
  Future<Map<String, dynamic>> updateUserDetails(int userId, Map<String, dynamic> data) async {
    try {
      final response = await _dioClient.dio.put('${ApiConstants.baseUrl}/api/users/$userId', data: data);
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể cập nhật thông tin tài khoản.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi cập nhật thông tin.'));
    }
  }

  // 21. Change Password
  Future<void> changePassword(int userId, String currentPassword, String newPassword) async {
    try {
      final response = await _dioClient.dio.post(
        '${ApiConstants.baseUrl}/api/users/$userId/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      if (response.statusCode != 200) {
        throw Exception('Không thể đổi mật khẩu.');
      }
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi đổi mật khẩu.'));
    }
  }

  // 22. Create Payment Link (PayOS)
  Future<Map<String, dynamic>> createPaymentLink({
    required int planId,
    required String returnUrl,
    required String cancelUrl,
  }) async {
    try {
      final response = await _dioClient.dio.post(
        '${ApiConstants.baseUrl}/api/payments/create-payment-link',
        data: {
          'planId': planId,
          'returnUrl': returnUrl,
          'cancelUrl': cancelUrl,
        },
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể tạo liên kết thanh toán.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi kết nối khi tạo link thanh toán.'));
    }
  }

  // 23. Get Payment Status (PayOS / Sync)
  Future<Map<String, dynamic>> getPaymentStatus(int orderCode) async {
    try {
      final response = await _dioClient.dio.get(
        '${ApiConstants.baseUrl}/api/payments/status/$orderCode',
      );
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      throw Exception('Không thể kiểm tra trạng thái thanh toán.');
    } on DioException catch (e) {
      throw Exception(ErrorHandler.getDioErrorMessage(e, 'Lỗi kết nối khi kiểm tra trạng thái.'));
    }
  }

  // 24. Get Active Subscription of Current User
  Future<Map<String, dynamic>?> getActiveSubscription() async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/user_subscriptions/current');
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // 25. Get Learned Vocabulary count for a specific user
  Future<int> getLearnedVocabCount(int userId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/user_vocabulary_progress?pageSize=1000');
      if (response.statusCode == 200) {
        final rawData = response.data;
        List<dynamic> items = [];
        if (rawData is List) {
          items = rawData;
        } else if (rawData is Map) {
          items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? [];
        }
        // Count items belonging to userId where status is Completed (2)
        final completedItems = items.where((p) =>
          (p['userId'] ?? p['UserId']) == userId &&
          (p['status'] ?? p['Status'] ?? 0) == 2
        );
        return completedItems.length;
      }
      return 0;
    } catch (_) {
      return 0;
    }
  }

  // 26. Get user activity logs
  Future<List<Map<String, dynamic>>> getUserActivityLogs() async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.baseUrl}/api/user_activity_logs?pageSize=1000');
      if (response.statusCode == 200) {
        final rawData = response.data;
        List<dynamic> items = [];
        if (rawData is List) {
          items = rawData;
        } else if (rawData is Map) {
          items = rawData['items'] ?? rawData['Items'] ?? rawData['data'] ?? [];
        }
        return items.map((json) => json as Map<String, dynamic>).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}


