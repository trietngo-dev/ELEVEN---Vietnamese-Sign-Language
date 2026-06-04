class NotificationModel {
  final int id;
  final int userId;
  final String title;
  final String message;
  final String type; // subscription, learning, system
  final bool isRead;
  final String? actionUrl;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    this.actionUrl,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: (json['id'] ?? json['Id'] ?? 0) as int,
      userId: (json['userId'] ?? json['UserId'] ?? 0) as int,
      title: (json['title'] ?? json['Title'] ?? '') as String,
      message: (json['message'] ?? json['Message'] ?? '') as String,
      type: (json['type'] ?? json['Type'] ?? 'system') as String,
      isRead: (json['isRead'] ?? json['IsRead'] ?? false) as bool,
      actionUrl: json['actionUrl'] ?? json['ActionUrl'] as String?,
      createdAt: DateTime.parse((json['createdAt'] ?? json['CreatedAt'] ?? DateTime.now().toIso8601String()) as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'message': message,
      'type': type,
      'isRead': isRead,
      'actionUrl': actionUrl,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
