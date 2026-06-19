import '../../entities/user_entity.dart';
import '../../repositories/auth_repository.dart';

class UpdateUserInfoUseCase {
  final AuthRepository repository;
  UpdateUserInfoUseCase(this.repository);

  Future<UserEntity> call(int userId, String fullName) {
    return repository.updateUserInfo(userId, fullName);
  }
}
