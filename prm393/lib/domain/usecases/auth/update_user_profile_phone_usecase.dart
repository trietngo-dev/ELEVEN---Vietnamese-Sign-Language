import '../../repositories/auth_repository.dart';

class UpdateUserProfilePhoneUseCase {
  final AuthRepository repository;
  UpdateUserProfilePhoneUseCase(this.repository);

  Future<void> call(int userId, String phone) {
    return repository.updateUserProfilePhone(userId, phone);
  }
}
