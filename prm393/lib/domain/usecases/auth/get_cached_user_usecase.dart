import '../../entities/user_entity.dart';
import '../../repositories/auth_repository.dart';

class GetCachedUserUseCase {
  final AuthRepository repository;
  GetCachedUserUseCase(this.repository);

  Future<UserEntity?> call() {
    return repository.getCachedUser();
  }
}
