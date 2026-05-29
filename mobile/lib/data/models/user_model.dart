class UserModel {
  final int id;
  final String fullName;
  final String email;
  final String role;
  final String? token;

  UserModel({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['id'] as int,
      fullName: (json['fullName'] ?? json['username'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      role: (json['role'] ?? 'learner') as String,
      token: token ?? json['token'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'role': role,
      if (token != null) 'token': token,
    };
  }
}
