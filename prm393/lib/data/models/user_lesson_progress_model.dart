import '../../domain/entities/user_lesson_progress_entity.dart';

class UserLessonProgressModel extends UserLessonProgressEntity {
  UserLessonProgressModel({
    required super.id,
    required super.userId,
    required super.lessonId,
    required super.status,
    super.startedAt,
    super.completedAt,
    required super.lastPositionSeconds,
    required super.attemptsCount,
    required super.bestAccuracy,
    required super.bestScore,
    required super.totalTimeSeconds,
    required super.xpEarned,
  });

  factory UserLessonProgressModel.fromJson(Map<String, dynamic> json) {
    // Backend returns status as int or string enum. Map it to int:
    final rawStatus = json['status'] ?? json['Status'];
    int statusInt = 0;
    if (rawStatus is int) {
      statusInt = rawStatus;
    } else if (rawStatus is String) {
      if (rawStatus == 'Completed') {
        statusInt = 2;
      } else if (rawStatus == 'InProgress') {
        statusInt = 1;
      } else {
        statusInt = 0;
      }
    }

    return UserLessonProgressModel(
      id: json['id'] as int? ?? json['Id'] as int? ?? 0,
      userId: json['userId'] as int? ?? json['UserId'] as int? ?? 0,
      lessonId: json['lessonId'] as int? ?? json['LessonId'] as int? ?? 0,
      status: statusInt,
      startedAt: json['startedAt'] as String? ?? json['StartedAt'] as String?,
      completedAt: json['completedAt'] as String? ?? json['CompletedAt'] as String?,
      lastPositionSeconds: json['lastPositionSeconds'] as int? ?? json['LastPositionSeconds'] as int? ?? 0,
      attemptsCount: json['attemptsCount'] as int? ?? json['AttemptsCount'] as int? ?? 0,
      bestAccuracy: (json['bestAccuracy'] ?? json['BestAccuracy'] as num? ?? 0.0).toDouble(),
      bestScore: (json['bestScore'] ?? json['BestScore'] as num? ?? 0.0).toDouble(),
      totalTimeSeconds: json['totalTimeSeconds'] as int? ?? json['TotalTimeSeconds'] as int? ?? 0,
      xpEarned: json['xpEarned'] as int? ?? json['XpEarned'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'lessonId': lessonId,
      'status': status,
      'startedAt': startedAt,
      'completedAt': completedAt,
      'lastPositionSeconds': lastPositionSeconds,
      'attemptsCount': attemptsCount,
      'bestAccuracy': bestAccuracy,
      'bestScore': bestScore,
      'totalTimeSeconds': totalTimeSeconds,
      'xpEarned': xpEarned,
    };
  }
}
