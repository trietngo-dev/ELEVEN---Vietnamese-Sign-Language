import '../../domain/entities/lesson_entity.dart';

class LessonModel extends LessonEntity {
  LessonModel({
    required super.id,
    required super.courseId,
    required super.moduleId,
    required super.title,
    required super.slug,
    super.shortDescription,
    super.objectiveText,
    super.coverMediaId,
    super.videoMediaId,
    super.videoUrl,
    required super.lessonType,
    required super.difficultyLevel,
    required super.estimatedMinutes,
    required super.xpReward,
    required super.sortOrder,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) {
    return LessonModel(
      id: json['id'] as int? ?? json['Id'] as int? ?? 0,
      courseId: json['courseId'] as int? ?? json['CourseId'] as int? ?? 0,
      moduleId: json['moduleId'] as int? ?? json['ModuleId'] as int? ?? 0,
      title: json['title'] as String? ?? json['Title'] as String? ?? '',
      slug: json['slug'] as String? ?? json['Slug'] as String? ?? '',
      shortDescription: json['shortDescription'] as String? ?? json['ShortDescription'] as String?,
      objectiveText: json['objectiveText'] as String? ?? json['ObjectiveText'] as String?,
      coverMediaId: json['coverMediaId'] as int? ?? json['CoverMediaId'] as int?,
      videoMediaId: json['videoMediaId'] as int? ?? json['VideoMediaId'] as int?,
      videoUrl: json['videoUrl'] as String? ?? json['VideoUrl'] as String?,
      lessonType: json['lessonType'] as String? ?? json['LessonType'] as String? ?? 'Video',
      difficultyLevel: json['difficultyLevel'] as String? ?? json['DifficultyLevel'] as String? ?? 'Beginner',
      estimatedMinutes: json['estimatedMinutes'] as int? ?? json['EstimatedMinutes'] as int? ?? 0,
      xpReward: json['xpReward'] as int? ?? json['XpReward'] as int? ?? 0,
      sortOrder: json['sortOrder'] as int? ?? json['SortOrder'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'courseId': courseId,
      'moduleId': moduleId,
      'title': title,
      'slug': slug,
      'shortDescription': shortDescription,
      'objectiveText': objectiveText,
      'coverMediaId': coverMediaId,
      'videoMediaId': videoMediaId,
      'videoUrl': videoUrl,
      'lessonType': lessonType,
      'difficultyLevel': difficultyLevel,
      'estimatedMinutes': estimatedMinutes,
      'xpReward': xpReward,
      'sortOrder': sortOrder,
    };
  }
}
