import '../../repositories/auth_repository.dart';

class DeleteAccountUseCase {
  final AuthRepository repository;
  DeleteAccountUseCase(this.repository);

  Future<void> call(int userId) {
    return repository.deleteAccount(userId);
  }
}
