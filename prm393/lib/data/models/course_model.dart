import '../../domain/entities/course_entity.dart';

class CourseModel extends CourseEntity {
  CourseModel({
    required super.id,
    required super.categoryId,
    required super.title,
    required super.slug,
    super.summary,
    super.description,
    required super.level,
    super.coverMediaId,
    super.trailerMediaId,
    required super.isPremium,
    required super.status,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    // Backend might return status as int (e.g. 1) or string (e.g. "Published")
    final rawStatus = json['status'] ?? json['Status'];
    String statusStr = 'Draft';
    if (rawStatus is int) {
      statusStr = rawStatus == 1 ? 'Published' : 'Draft';
    } else if (rawStatus is String) {
      statusStr = rawStatus;
    }

    return CourseModel(
      id: json['id'] as int? ?? json['Id'] as int? ?? 0,
      categoryId: json['categoryId'] as int? ?? json['CategoryId'] as int? ?? 0,
      title: json['title'] as String? ?? json['Title'] as String? ?? '',
      slug: json['slug'] as String? ?? json['Slug'] as String? ?? '',
      summary: json['summary'] as String? ?? json['Summary'] as String?,
      description: json['description'] as String? ?? json['Description'] as String?,
      level: json['level'] as String? ?? json['Level'] as String? ?? 'Cơ bản',
      coverMediaId: json['coverMediaId'] as int? ?? json['CoverMediaId'] as int?,
      trailerMediaId: json['trailerMediaId'] as int? ?? json['TrailerMediaId'] as int?,
      isPremium: json['isPremium'] as bool? ?? json['IsPremium'] as bool? ?? false,
      status: statusStr,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'categoryId': categoryId,
      'title': title,
      'slug': slug,
      'summary': summary,
      'description': description,
      'level': level,
      'coverMediaId': coverMediaId,
      'trailerMediaId': trailerMediaId,
      'isPremium': isPremium,
      'status': status,
    };
  }
}
