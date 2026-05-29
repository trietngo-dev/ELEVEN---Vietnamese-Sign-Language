class CourseModel {
  final int id;
  final String title;
  final String description;
  final String? level;
  final double averageRating;
  final double totalHours;
  final int lessonsCount;
  final int? thumbnailMediaId;
  final int? categoryId;
  final String? slug;
  final String? summary;
  final bool isPremium;

  CourseModel({
    required this.id,
    required this.title,
    required this.description,
    this.level,
    required this.averageRating,
    required this.totalHours,
    required this.lessonsCount,
    this.thumbnailMediaId,
    this.categoryId,
    this.slug,
    this.summary,
    required this.isPremium,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: (json['id'] ?? 0) as int,
      title: (json['title'] ?? json['Title'] ?? '') as String,
      description: (json['description'] ?? json['Description'] ?? '') as String,
      level: (json['level'] ?? json['Level']) as String?,
      averageRating: (json['averageRating'] ?? json['AverageRating'] ?? json['rating'] ?? 0.0).toDouble(),
      totalHours: (json['totalHours'] ?? json['TotalHours'] ?? 0.0).toDouble(),
      lessonsCount: (json['lessonsCount'] ?? json['LessonsCount'] ?? 0) as int,
      thumbnailMediaId: (json['thumbnailMediaId'] ?? json['ThumbnailMediaId'] ?? json['coverMediaId'] ?? json['CoverMediaId']) as int?,
      categoryId: (json['categoryId'] ?? json['CategoryId']) as int?,
      slug: (json['slug'] ?? json['Slug']) as String?,
      summary: (json['summary'] ?? json['Summary']) as String?,
      isPremium: (json['isPremium'] ?? json['IsPremium'] ?? false) as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'level': level,
      'averageRating': averageRating,
      'totalHours': totalHours,
      'lessonsCount': lessonsCount,
      'thumbnailMediaId': thumbnailMediaId,
      'categoryId': categoryId,
      'slug': slug,
      'summary': summary,
      'isPremium': isPremium,
    };
  }
}
