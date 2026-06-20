import '../../repositories/auth_repository.dart';

class GetUserProfilePhoneUseCase {
  final AuthRepository repository;
  GetUserProfilePhoneUseCase(this.repository);

  Future<String?> call(int userId) {
    return repository.getUserProfilePhone(userId);
  }
}
