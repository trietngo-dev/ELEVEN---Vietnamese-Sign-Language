import '../../entities/user_entity.dart';
import '../../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;
  RegisterUseCase(this.repository);

  Future<UserEntity> call(String fullName, String email, String password) {
    return repository.register(fullName, email, password);
  }
}
