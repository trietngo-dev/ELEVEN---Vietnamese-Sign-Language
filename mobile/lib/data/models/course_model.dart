class CourseModel {
  final int id;
  final String title;
  final String description;
  final String? level;
  final double averageRating;
  final double totalHours;
  final int lessonsCount;
  final int? thumbnailMediaId;

  CourseModel({
    required this.id,
    required this.title,
    required this.description,
    this.level,
    required this.averageRating,
    required this.totalHours,
    required this.lessonsCount,
    this.thumbnailMediaId,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] as int,
      title: (json['title'] ?? '') as String,
      description: (json['description'] ?? '') as String,
      level: json['level'] as String?,
      averageRating: (json['averageRating'] ?? json['rating'] ?? 0.0).toDouble(),
      totalHours: (json['totalHours'] ?? 0.0).toDouble(),
      lessonsCount: json['lessonsCount'] as int? ?? 0,
      thumbnailMediaId: json['thumbnailMediaId'] as int?,
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
    };
  }
}
