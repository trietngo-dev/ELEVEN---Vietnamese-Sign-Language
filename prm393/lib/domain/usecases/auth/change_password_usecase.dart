import '../../repositories/auth_repository.dart';

class ChangePasswordUseCase {
  final AuthRepository repository;
  ChangePasswordUseCase(this.repository);

  Future<void> call(int userId, String currentPassword, String newPassword) {
    return repository.changePassword(userId, currentPassword, newPassword);
  }
}
