import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  // Mock data for notifications with unread states
  final List<Map<String, dynamic>> _todayNotifications = [
    {
      'id': '1',
      'title': 'Bài học mới: Gia đình',
      'body': 'Học các ký hiệu về chủ đề Gia đình ngay để tích lũy thêm điểm kinh nghiệm.',
      'time': '2 giờ trước',
      'icon': Icons.school_rounded,
      'iconColor': AppTheme.secondaryColor,
      'isUnread': true,
    },
    {
      'id': '2',
      'title': 'Thành tích mới!',
      'body': 'Bạn đã hoàn thành 5 ngày học liên tiếp. Tuyệt vời!',
      'time': '5 giờ trước',
      'icon': Icons.star_rounded,
      'iconColor': const Color(0xFFD0BCFF), // Tertiary Amethyst
      'isUnread': true,
    },
  ];

  final List<Map<String, dynamic>> _thisWeekNotifications = [
    {
      'id': '3',
      'title': 'Cập nhật ứng dụng',
      'body': 'Phiên bản mới 2.0 đã sẵn sàng với nhiều bài học ngôn ngữ ký hiệu mới.',
      'time': 'Thứ 4',
      'icon': Icons.info_rounded,
      'iconColor': AppTheme.onSurfaceVariant,
      'isUnread': false,
    },
    {
      'id': '4',
      'title': 'Ôn tập cuối tuần',
      'body': 'Đừng quên ôn lại các ký hiệu về "Chào hỏi" bạn đã học nhé.',
      'time': 'Thứ 2',
      'icon': Icons.history_edu_rounded,
      'iconColor': AppTheme.onSurfaceVariant,
      'isUnread': false,
    },
  ];

  void _markAsRead(String id) {
    setState(() {
      for (var n in _todayNotifications) {
        if (n['id'] == id) n['isUnread'] = false;
      }
      for (var n in _thisWeekNotifications) {
        if (n['id'] == id) n['isUnread'] = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.primaryColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Thông báo',
          style: textTheme.headlineSmall?.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.primaryColor),
            onPressed: () {},
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: Colors.white.withOpacity(0.05),
            height: 1.0,
          ),
        ),
      ),
      body: Stack(
        children: [
          Container(color: AppTheme.backgroundColor),
          Positioned(
            top: sizeHeightFraction(context, 0.2),
            left: -80,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryColor.withOpacity(0.04),
              ),
            ),
          ),
          Positioned(
            bottom: sizeHeightFraction(context, 0.2),
            right: -80,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.secondaryColor.withOpacity(0.03),
              ),
            ),
          ),

          // Scrollable Notifications List
          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_todayNotifications.isNotEmpty) ...[
                      Text(
                        'HÔM NAY',
                        style: textTheme.labelLarge?.copyWith(
                          fontSize: 12,
                          color: AppTheme.onSurfaceVariant,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ..._todayNotifications.map((notif) => Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: _buildNotificationCard(notif, textTheme),
                          )),
                      const SizedBox(height: 24),
                    ],
                    if (_thisWeekNotifications.isNotEmpty) ...[
                      Text(
                        'TUẦN NÀY',
                        style: textTheme.labelLarge?.copyWith(
                          fontSize: 12,
                          color: AppTheme.onSurfaceVariant,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ..._thisWeekNotifications.map((notif) => Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: _buildNotificationCard(notif, textTheme),
                          )),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  double sizeHeightFraction(BuildContext context, double fraction) {
    return MediaQuery.of(context).size.height * fraction;
  }

  Widget _buildNotificationCard(Map<String, dynamic> notif, TextTheme textTheme) {
    final id = notif['id'] as String;
    final title = notif['title'] as String;
    final body = notif['body'] as String;
    final time = notif['time'] as String;
    final icon = notif['icon'] as IconData;
    final color = notif['iconColor'] as Color;
    final isUnread = notif['isUnread'] as bool;

    return GestureDetector(
      onTap: () => _markAsRead(id),
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: isUnread ? 1.0 : 0.75,
        child: AppTheme.glassPanel(
          borderRadius: 16.0,
          padding: const EdgeInsets.all(16.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: color.withOpacity(0.15),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        Text(
                          time,
                          style: textTheme.bodyMedium?.copyWith(
                            fontSize: 11,
                            color: AppTheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      body,
                      style: textTheme.bodyMedium?.copyWith(
                        color: AppTheme.onSurfaceVariant,
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              if (isUnread) ...[
                const SizedBox(width: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.primaryColor,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withOpacity(0.6),
                          blurRadius: 6,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
