import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'package:google_sign_in/google_sign_in.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final DioClient _dioClient;

  AuthRemoteDataSource(this._dioClient);

  Future<UserModel> login(String email, String password) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        final token = (data['token'] ?? 
            data['accessToken'] ?? 
            data['sessionToken'] ?? 
            data['AccessToken'] ?? 
            data['SessionToken']) as String?;
        final userJson = data['user'] as Map<String, dynamic>? ?? data;

        final user = UserModel.fromJson(userJson, token: token);
        
        // Save auth token and user profile details locally
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', token);
          await prefs.setInt('auth_user_id', user.id);
          await prefs.setString('auth_user_role', user.role);
          await prefs.setString('auth_user_name', user.fullName);
          await prefs.setString('auth_user_email', user.email);
        }
        
        return user;
      } else {
        throw Exception(response.data['message'] ?? 'Đăng nhập thất bại.');
      }
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ hoặc sai thông tin.';
      throw Exception(message);
    } catch (e) {
      throw Exception('Lỗi không xác định: ${e.toString()}');
    }
  }

  Future<UserModel> register(String fullName, String email, String password) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.register,
        data: {
          'username': fullName, // Maps to backend schema
          'fullName': fullName,
          'email': email,
          'password': password,
          'role': 'learner',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        final token = (data['token'] ?? 
            data['accessToken'] ?? 
            data['sessionToken'] ?? 
            data['AccessToken'] ?? 
            data['SessionToken']) as String?;
        final userJson = data['user'] as Map<String, dynamic>? ?? data;

        final user = UserModel.fromJson(userJson, token: token);
        
        // Save auth token and user profile details locally
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', token);
          await prefs.setInt('auth_user_id', user.id);
          await prefs.setString('auth_user_role', user.role);
          await prefs.setString('auth_user_name', user.fullName);
          await prefs.setString('auth_user_email', user.email);
        }
        
        return user;
      } else {
        throw Exception(response.data['message'] ?? 'Đăng ký thất bại.');
      }
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ hoặc email đã tồn tại.';
      throw Exception(message);
    } catch (e) {
      throw Exception('Lỗi không xác định: ${e.toString()}');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_user_id');
    await prefs.remove('auth_user_role');
    await prefs.remove('auth_user_name');
    await prefs.remove('auth_user_email');
    
    try {
      await fb.FirebaseAuth.instance.signOut();
      await GoogleSignIn().signOut();
    } catch (_) {}
  }

  Future<bool> isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('auth_token');
  }

  Future<UserModel?> getCachedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    final id = prefs.getInt('auth_user_id');
    final role = prefs.getString('auth_user_role');
    final name = prefs.getString('auth_user_name');
    final email = prefs.getString('auth_user_email');

    if (token != null && id != null && role != null && name != null) {
      return UserModel(
        id: id,
        fullName: name,
        email: email ?? '',
        role: role,
        token: token,
      );
    }
    return null;
  }

  Future<UserModel> loginWithGoogle() async {
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception("Đã hủy đăng nhập Google.");
      }

      final googleAuth = await googleUser.authentication;
      final String? googleIdToken = googleAuth.idToken;
      final String? googleAccessToken = googleAuth.accessToken;

      if (googleIdToken == null) {
        throw Exception("Không thể lấy ID Token từ Google.");
      }

      // Sign in to Firebase Auth
      final fb.AuthCredential credential = fb.GoogleAuthProvider.credential(
        accessToken: googleAccessToken,
        idToken: googleIdToken,
      );
      await fb.FirebaseAuth.instance.signInWithCredential(credential);

      // Authenticate with backend API
      final response = await _dioClient.dio.post(
        '/api/users/google-login',
        data: {
          'idToken': googleIdToken,
          'fullName': googleUser.displayName,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        final token = (data['token'] ?? 
            data['accessToken'] ?? 
            data['sessionToken'] ?? 
            data['AccessToken'] ?? 
            data['SessionToken']) as String?;
        final userJson = data['user'] as Map<String, dynamic>? ?? data;

        final user = UserModel.fromJson(userJson, token: token);
        
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', token);
          await prefs.setInt('auth_user_id', user.id);
          await prefs.setString('auth_user_role', user.role);
          await prefs.setString('auth_user_name', user.fullName);
          await prefs.setString('auth_user_email', user.email);
        }
        
        return user;
      } else {
        throw Exception(response.data['message'] ?? 'Đăng nhập Google thất bại.');
      }
    } on fb.FirebaseAuthException catch (e) {
      throw Exception('Lỗi Firebase Auth: ${e.message}');
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.';
      throw Exception(message);
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> deleteAccount(int userId) async {
    try {
      final response = await _dioClient.dio.delete('/api/users/$userId');
      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception(response.data?['message'] ?? 'Xóa tài khoản thất bại.');
      }
      
      try {
        final currentUser = fb.FirebaseAuth.instance.currentUser;
        if (currentUser != null) {
          await currentUser.delete();
        }
      } catch (_) {}

      await logout();
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.';
      throw Exception(message);
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<UserModel> updateUserInfo(int userId, String fullName) async {
    try {
      final getResponse = await _dioClient.dio.get('/api/users/$userId');
      if (getResponse.statusCode != 200) {
        throw Exception('Không thể lấy thông tin tài khoản hiện tại.');
      }
      
      final currentData = getResponse.data as Map<String, dynamic>;
      final roleId = currentData['roleId'] ?? currentData['RoleId'];
      final email = currentData['email'] ?? currentData['Email'] ?? '';
      final avatarMediaId = currentData['avatarMediaId'] ?? currentData['AvatarMediaId'];
      final status = currentData['status'] ?? currentData['Status'] ?? 1;

      final putResponse = await _dioClient.dio.put(
        '/api/users/$userId',
        data: {
          'roleId': roleId,
          'email': email,
          'fullName': fullName,
          'avatarMediaId': avatarMediaId,
          'status': status,
        },
      );

      if (putResponse.statusCode == 200) {
        final data = putResponse.data as Map<String, dynamic>;
        final user = UserModel.fromJson(data);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_user_name', user.fullName);
        return user;
      } else {
        throw Exception(putResponse.data['message'] ?? 'Cập nhật thông tin thất bại.');
      }
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.';
      throw Exception(message);
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> updateUserProfilePhone(int userId, String phone) async {
    try {
      final getResponse = await _dioClient.dio.get('/api/user_profiles/$userId');
      if (getResponse.statusCode != 200) {
        throw Exception('Không thể lấy hồ sơ cá nhân hiện tại.');
      }

      final currentData = getResponse.data as Map<String, dynamic>;
      final dateOfBirth = currentData['dateOfBirth'] ?? currentData['DateOfBirth'];
      final gender = currentData['gender'] ?? currentData['Gender'];
      final bio = currentData['bio'] ?? currentData['Bio'];
      final timezone = currentData['timezone'] ?? currentData['Timezone'] ?? 'Asia/Ho_Chi_Minh';
      final preferredSignVariant = currentData['preferredSignVariant'] ?? currentData['PreferredSignVariant'];
      final currentStreakDays = currentData['currentStreakDays'] ?? currentData['CurrentStreakDays'] ?? 0;
      final totalXp = currentData['totalXp'] ?? currentData['TotalXp'] ?? 0;
      final activeFrameId = currentData['activeFrameId'] ?? currentData['ActiveFrameId'];

      final putResponse = await _dioClient.dio.put(
        '/api/user_profiles/$userId',
        data: {
          'phone': phone,
          'dateOfBirth': dateOfBirth,
          'gender': gender,
          'bio': bio,
          'timezone': timezone,
          'preferredSignVariant': preferredSignVariant,
          'currentStreakDays': currentStreakDays,
          'totalXp': totalXp,
          'activeFrameId': activeFrameId,
        },
      );

      if (putResponse.statusCode != 200) {
        throw Exception(putResponse.data?['message'] ?? 'Cập nhật số điện thoại thất bại.');
      }
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.';
      throw Exception(message);
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> changePassword(int userId, String currentPassword, String newPassword) async {
    try {
      final response = await _dioClient.dio.post(
        '/api/users/$userId/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      if (response.statusCode != 200) {
        throw Exception(response.data?['message'] ?? 'Thay đổi mật khẩu thất bại.');
      }
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ hoặc mật khẩu hiện tại không đúng.';
      throw Exception(message);
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<String?> getUserProfilePhone(int userId) async {
    try {
      final response = await _dioClient.dio.get('/api/user_profiles/$userId');
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        return (data['phone'] ?? data['Phone']) as String?;
      }
    } catch (_) {}
    return null;
  }
}
