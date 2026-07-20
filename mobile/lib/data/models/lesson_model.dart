class LessonModel {
  final int id;
  final int courseId;
  final String title;
  final String? content;
  final int orderIndex;
  final int? videoMediaId;
  final int xpEarned;

  LessonModel({
    required this.id,
    required this.courseId,
    required this.title,
    this.content,
    required this.orderIndex,
    this.videoMediaId,
    required this.xpEarned,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) {
    return LessonModel(
      id: json['id'] as int,
      courseId: json['courseId'] as int? ?? 0,
      title: (json['title'] ?? '') as String,
      content: json['content'] as String?,
      orderIndex: json['orderIndex'] as int? ?? 0,
      videoMediaId: json['videoMediaId'] as int?,
      xpEarned: json['xpEarned'] as int? ?? 50,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'courseId': courseId,
      'title': title,
      'content': content,
      'orderIndex': orderIndex,
      'videoMediaId': videoMediaId,
      'xpEarned': xpEarned,
    };
  }
}
