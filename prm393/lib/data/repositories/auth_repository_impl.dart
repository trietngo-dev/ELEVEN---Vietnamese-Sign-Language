import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepositoryImpl(this.remoteDataSource);

  @override
  Future<UserEntity> login(String email, String password) {
    return remoteDataSource.login(email, password);
  }

  @override
  Future<UserEntity> register(String fullName, String email, String password) {
    return remoteDataSource.register(fullName, email, password);
  }

  @override
  Future<void> logout() {
    return remoteDataSource.logout();
  }

  @override
  Future<bool> isAuthenticated() {
    return remoteDataSource.isAuthenticated();
  }

  @override
  Future<UserEntity?> getCachedUser() {
    return remoteDataSource.getCachedUser();
  }

  @override
  Future<UserEntity> loginWithGoogle() {
    return remoteDataSource.loginWithGoogle();
  }

  @override
  Future<void> deleteAccount(int userId) {
    return remoteDataSource.deleteAccount(userId);
  }

  @override
  Future<UserEntity> updateUserInfo(int userId, String fullName) {
    return remoteDataSource.updateUserInfo(userId, fullName);
  }

  @override
  Future<void> updateUserProfilePhone(int userId, String phone) {
    return remoteDataSource.updateUserProfilePhone(userId, phone);
  }

  @override
  Future<void> changePassword(int userId, String currentPassword, String newPassword) {
    return remoteDataSource.changePassword(userId, currentPassword, newPassword);
  }

  @override
  Future<String?> getUserProfilePhone(int userId) {
    return remoteDataSource.getUserProfilePhone(userId);
  }
}
