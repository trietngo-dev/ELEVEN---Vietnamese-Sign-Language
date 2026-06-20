import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> login(String email, String password);
  Future<UserEntity> register(String fullName, String email, String password);
  Future<void> logout();
  Future<bool> isAuthenticated();
  Future<UserEntity?> getCachedUser();
  Future<UserEntity> loginWithGoogle();
  Future<void> deleteAccount(int userId);
  Future<UserEntity> updateUserInfo(int userId, String fullName);
  Future<void> updateUserProfilePhone(int userId, String phone);
  Future<void> changePassword(int userId, String currentPassword, String newPassword);
  Future<String?> getUserProfilePhone(int userId);
}
