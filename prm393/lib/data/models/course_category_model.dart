import '../../domain/entities/course_category_entity.dart';

class CourseCategoryModel extends CourseCategoryEntity {
  CourseCategoryModel({
    required super.id,
    required super.name,
    required super.slug,
    super.description,
    super.colorHex,
    super.iconMediaId,
  });

  factory CourseCategoryModel.fromJson(Map<String, dynamic> json) {
    return CourseCategoryModel(
      id: json['id'] as int? ?? json['Id'] as int? ?? 0,
      name: json['name'] as String? ?? json['Name'] as String? ?? '',
      slug: json['slug'] as String? ?? json['Slug'] as String? ?? '',
      description: json['description'] as String? ?? json['Description'] as String?,
      colorHex: json['colorHex'] as String? ?? json['ColorHex'] as String?,
      iconMediaId: json['iconMediaId'] as int? ?? json['IconMediaId'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'colorHex': colorHex,
      'iconMediaId': iconMediaId,
    };
  }
}
