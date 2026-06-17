import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';
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
    const Color mintColor = Color(0xFF10B981);

    return ValueListenableBuilder<bool>(
      valueListenable: AppTheme.isWhiteBgNotifier,
      builder: (context, isWhiteBg, child) {
        final Color currentBgColor = isWhiteBg ? const Color(0xFFF8FDF8) : const Color(0xFF0A0F0D);
        final Color currentCardColor = isWhiteBg ? const Color(0xFFE8F5E9) : const Color(0xFF131A16);
        final Color currentTextColor = isWhiteBg ? const Color(0xFF1E293B) : Colors.white;
        final Color currentTextMutedColor = isWhiteBg ? const Color(0xFF64748B) : const Color(0xFF94A3B8);

        return Scaffold(
          backgroundColor: currentBgColor,
          appBar: AppBar(
            backgroundColor: currentBgColor,
            elevation: 0,
            leading: IconButton(
              icon: Icon(Icons.arrow_back_ios_new_rounded, color: currentTextColor, size: 20),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: Text(
              "THÔNG BÁO",
              style: GoogleFonts.quicksand(
                fontWeight: FontWeight.bold,
                color: currentTextColor,
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
                                mainAxisAlignment: MainAxisAlignment.center,
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
                                  Text(
                                    'Chưa có thông báo nào.',
                                    style: TextStyle(color: currentTextMutedColor, fontSize: 13, fontWeight: FontWeight.bold),
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
                            final bool isUnread = !(notif.isRead);

                            return InkWell(
                              onTap: () => _markAsRead(notif),
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: currentCardColor,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isUnread
                                        ? mintColor.withValues(alpha: 0.3)
                                        : Colors.white.withValues(alpha: 0.04),
                                    width: isUnread ? 1.5 : 1,
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Status dot/icon
                                    Container(
                                      margin: const EdgeInsets.only(top: 3),
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        color: isUnread ? mintColor : Colors.transparent,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 12),

                                    // Content
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            notif.title,
                                            style: TextStyle(
                                              color: currentTextColor,
                                              fontSize: 13,
                                              fontWeight: isUnread ? FontWeight.bold : FontWeight.w600,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            notif.message,
                                            style: TextStyle(color: currentTextMutedColor, fontSize: 12),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            _formatDate(notif.createdAt),
                                            style: TextStyle(color: currentTextColor.withValues(alpha: 0.3), fontSize: 10),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 8),

                                    // Delete icon
                                    IconButton(
                                      icon: Icon(Icons.close_rounded, color: currentTextColor.withValues(alpha: 0.3), size: 16),
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
      },
    );
  }

  String _formatDate(DateTime dt) {
    final localDt = dt.toLocal();
    final hour = localDt.hour.toString().padLeft(2, '0');
    final minute = localDt.minute.toString().padLeft(2, '0');
    final day = localDt.day.toString().padLeft(2, '0');
    final month = localDt.month.toString().padLeft(2, '0');
    final year = localDt.year;
    return "$hour:$minute - $day/$month/$year";
  }
}
