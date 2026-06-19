class UserEntity {
  final int id;
  final String fullName;
  final String email;
  final String role;
  final String? token;

  const UserEntity({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    this.token,
  });
}
