class BadgeModel {
  final int id;
  final String code;
  final String name;
  final String description;

  BadgeModel({
    required this.id,
    required this.code,
    required this.name,
    required this.description,
  });

  factory BadgeModel.fromJson(Map<String, dynamic> json) {
    return BadgeModel(
      id: (json['id'] ?? json['Id'] ?? 0) as int,
      code: (json['code'] ?? json['Code'] ?? '') as String,
      name: (json['name'] ?? json['Name'] ?? '') as String,
      description: (json['description'] ?? json['Description'] ?? '') as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'description': description,
    };
  }
}
