class CourseCategoryEntity {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final String? colorHex;
  final int? iconMediaId;

  const CourseCategoryEntity({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.colorHex,
    this.iconMediaId,
  });
}
