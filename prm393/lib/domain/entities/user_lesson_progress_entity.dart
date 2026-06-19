class UserLessonProgressEntity {
  final int id;
  final int userId;
  final int lessonId;
  final int status; // 0 = NotStarted, 1 = InProgress, 2 = Completed
  final String? startedAt;
  final String? completedAt;
  final int lastPositionSeconds;
  final int attemptsCount;
  final double bestAccuracy;
  final double bestScore;
  final int totalTimeSeconds;
  final int xpEarned;

  const UserLessonProgressEntity({
    required this.id,
    required this.userId,
    required this.lessonId,
    required this.status,
    this.startedAt,
    this.completedAt,
    required this.lastPositionSeconds,
    required this.attemptsCount,
    required this.bestAccuracy,
    required this.bestScore,
    required this.totalTimeSeconds,
    required this.xpEarned,
  });
}
