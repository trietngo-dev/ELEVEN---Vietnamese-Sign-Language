class CourseEntity {
  final int id;
  final int categoryId;
  final String title;
  final String slug;
  final String? summary;
  final String? description;
  final String level;
  final int? coverMediaId;
  final int? trailerMediaId;
  final bool isPremium;
  final String status;

  const CourseEntity({
    required this.id,
    required this.categoryId,
    required this.title,
    required this.slug,
    this.summary,
    this.description,
    required this.level,
    this.coverMediaId,
    this.trailerMediaId,
    required this.isPremium,
    required this.status,
  });
}
