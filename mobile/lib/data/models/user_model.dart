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
    final dynamic rawId = json['id'] ?? json['userId'] ?? json['UserId'];
    final int parsedId = rawId is int 
        ? rawId 
        : (rawId != null ? int.tryParse(rawId.toString()) ?? 0 : 0);

    final String? parsedToken = token ?? 
        json['token'] ?? 
        json['accessToken'] ?? 
        json['sessionToken'] ?? 
        json['AccessToken'] ?? 
        json['SessionToken'];

    final String parsedRole = (json['role'] ?? 
        json['roleCode'] ?? 
        json['RoleCode'] ?? 
        'learner') as String;

    final String parsedEmail = (json['email'] ?? json['Email'] ?? '') as String;

    final String parsedFullName = (json['fullName'] ?? 
        json['FullName'] ?? 
        json['username'] ?? 
        json['Username'] ?? 
        '') as String;

    return UserModel(
      id: parsedId,
      fullName: parsedFullName,
      email: parsedEmail,
      role: parsedRole,
      token: parsedToken,
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
