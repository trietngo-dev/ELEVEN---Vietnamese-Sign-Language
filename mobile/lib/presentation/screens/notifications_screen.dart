import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/datasources/profile_data_source.dart';
import '../../data/models/notification_model.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;
  int _userId = 1;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    if (!mounted) return;
    final ds = context.read<ProfileDataSource>();
    setState(() {
      _isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      _userId = prefs.getInt('auth_user_id') ?? 1;

      final list = await ds.getUserNotifications(_userId);

      if (mounted) {
        setState(() {
          _notifications = list;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi tải thông báo: $e'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _markAsRead(NotificationModel notif) async {
    if (notif.isRead) return;
    try {
      final ds = context.read<ProfileDataSource>();
      final body = {
        'title': notif.title,
        'message': notif.message,
        'type': notif.type,
        'isRead': true,
        'actionUrl': notif.actionUrl,
        'readAt': DateTime.now().toUtc().toIso8601String(),
      };
      final success = await ds.markNotificationAsRead(notif.id, body);
      if (success) {
        setState(() {
          final index = _notifications.indexWhere((n) => n.id == notif.id);
          if (index != -1) {
            _notifications[index] = NotificationModel(
              id: notif.id,
              userId: notif.userId,
              title: notif.title,
              message: notif.message,
              type: notif.type,
              isRead: true,
              actionUrl: notif.actionUrl,
              createdAt: notif.createdAt,
            );
          }
        });
      }
    } catch (_) {}
  }

  Future<void> _deleteNotif(int id) async {
    try {
      final ds = context.read<ProfileDataSource>();
      final success = await ds.deleteNotification(id);
      if (success) {
        setState(() {
          _notifications.removeWhere((n) => n.id == id);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã xóa thông báo thành công.'),
              backgroundColor: Color(0xFF10B981),
              behavior: SnackBarBehavior.floating,
              duration: Duration(seconds: 1),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi xóa thông báo: $e'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color darkBgColor = Color(0xFF0A0F0D);
    const Color darkCardColor = Color(0xFF131A16);
    const Color mintColor = Color(0xFF10B981);
    const Color textMutedColor = Color(0xFF94A3B8);

    return Scaffold(
      backgroundColor: darkBgColor,
      appBar: AppBar(
        backgroundColor: darkBgColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          "THÔNG BÁO",
          style: GoogleFonts.quicksand(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: mintColor))
          : RefreshIndicator(
              onRefresh: _loadNotifications,
              color: mintColor,
              child: _notifications.isEmpty
                  ? ListView(
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.3),
                        Center(
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: mintColor.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.notifications_none_rounded, size: 36, color: mintColor),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Bạn không có thông báo nào.',
                                style: TextStyle(color: textMutedColor, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(20),
                      itemCount: _notifications.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final notif = _notifications[index];
                        
                        IconData icon = Icons.info_outline_rounded;
                        Color typeColor = mintColor;
                        if (notif.type == 'subscription') {
                          icon = Icons.star_rounded;
                          typeColor = Colors.amber;
                        } else if (notif.type == 'learning') {
                          icon = Icons.school_rounded;
                          typeColor = Colors.cyan;
                        }

                        return InkWell(
                          onTap: () => _markAsRead(notif),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: notif.isRead ? darkCardColor : const Color(0xFF1E2823),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: notif.isRead
                                    ? Colors.white.withValues(alpha: 0.04)
                                    : mintColor.withValues(alpha: 0.25),
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Left icon
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: typeColor.withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(icon, color: typeColor, size: 18),
                                ),
                                const SizedBox(width: 14),

                                // Title and content
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        notif.title,
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        notif.message,
                                        style: TextStyle(
                                          color: notif.isRead ? textMutedColor : Colors.white70,
                                          fontSize: 12.5,
                                          height: 1.4,
                                        ),
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        _formatDate(notif.createdAt),
                                        style: const TextStyle(color: Colors.white30, fontSize: 10),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),

                                // Delete icon
                                IconButton(
                                  icon: const Icon(Icons.close_rounded, color: Colors.white30, size: 16),
                                  onPressed: () => _deleteNotif(notif.id),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  String _formatDate(DateTime dt) {
    // Add timezone adjustment or simple format
    final localDt = dt.toLocal();
    final hour = localDt.hour.toString().padLeft(2, '0');
    final minute = localDt.minute.toString().padLeft(2, '0');
    final day = localDt.day.toString().padLeft(2, '0');
    final month = localDt.month.toString().padLeft(2, '0');
    final year = localDt.year;
    return "$hour:$minute - $day/$month/$year";
  }
}
