import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/dio_client.dart';
import '../models/user_model.dart';

class AuthDataSource {
  final DioClient _dioClient;

  AuthDataSource(this._dioClient);

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
        
        // Save auth data locally
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
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.';
      throw Exception(message);
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
        
        // Save auth data locally
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
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.';
      throw Exception(message);
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_user_id');
    await prefs.remove('auth_user_role');
    await prefs.remove('auth_user_name');
    await prefs.remove('auth_user_email');
  }

  Future<bool> isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('auth_token');
  }

  Future<UserModel> loginWithGoogle(String idToken, {String? fullName}) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.googleLogin,
        data: {
          'idToken': idToken,
          'fullName': fullName,
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
        
        // Save auth data locally
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
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ.';
      throw Exception(message);
    }
  }

  Future<void> deleteAccount(int userId) async {
    try {
      final response = await _dioClient.dio.delete(
        ApiConstants.deleteAccount(userId),
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception(response.data['message'] ?? 'Xóa tài khoản thất bại.');
      }
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ khi xóa tài khoản.';
      throw Exception(message);
    }
  }
}
