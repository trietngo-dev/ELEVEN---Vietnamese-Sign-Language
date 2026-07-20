import '../../core/constants/api_constants.dart';

class AvatarFrameModel {
  final int id;
  final String code;
  final String name;
  final String imageUrl;
  final int xpPrice;
  final bool isActive;

  AvatarFrameModel({
    required this.id,
    required this.code,
    required this.name,
    required this.imageUrl,
    required this.xpPrice,
    required this.isActive,
  });

  factory AvatarFrameModel.fromJson(Map<String, dynamic> json) {
    return AvatarFrameModel(
      id: (json['id'] ?? json['Id'] ?? 0) as int,
      code: (json['code'] ?? json['Code'] ?? '') as String,
      name: (json['name'] ?? json['Name'] ?? '') as String,
      imageUrl: (json['imageUrl'] ?? json['ImageUrl'] ?? '') as String,
      xpPrice: (json['xpPrice'] ?? json['XpPrice'] ?? 0) as int,
      isActive: (json['isActive'] ?? json['IsActive'] ?? true) as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'imageUrl': imageUrl,
      'xpPrice': xpPrice,
      'isActive': isActive,
    };
  }

  String get fullImageUrl {
    if (imageUrl.isEmpty) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return '${ApiConstants.baseUrl}$imageUrl';
  }
}
