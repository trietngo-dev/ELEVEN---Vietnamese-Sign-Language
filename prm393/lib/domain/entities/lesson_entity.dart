class LessonEntity {
  final int id;
  final int courseId;
  final int moduleId;
  final String title;
  final String slug;
  final String? shortDescription;
  final String? objectiveText;
  final int? coverMediaId;
  final int? videoMediaId;
  final String? videoUrl;
  final String lessonType;
  final String difficultyLevel;
  final int estimatedMinutes;
  final int xpReward;
  final int sortOrder;

  const LessonEntity({
    required this.id,
    required this.courseId,
    required this.moduleId,
    required this.title,
    required this.slug,
    this.shortDescription,
    this.objectiveText,
    this.coverMediaId,
    this.videoMediaId,
    this.videoUrl,
    required this.lessonType,
    required this.difficultyLevel,
    required this.estimatedMinutes,
    required this.xpReward,
    required this.sortOrder,
  });
}
