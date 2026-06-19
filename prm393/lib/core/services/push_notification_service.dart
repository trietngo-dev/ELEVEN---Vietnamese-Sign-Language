import 'dart:developer';
import 'package:firebase_messaging/firebase_messaging.dart';

// Background message handler (must be a top-level function)
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  log("Nhận thông báo ở chế độ nền (Background): ${message.messageId}");
}

class PushNotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // 1. Request permission (especially needed for iOS/macOS)
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      log('Người dùng đã cấp quyền nhận thông báo.');
    } else {
      log('Người dùng đã từ chối quyền nhận thông báo.');
    }

    // 2. Set background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // 3. Get FCM Token for testing from Firebase Console
    try {
      String? token = await _fcm.getToken();
      log("=========================================");
      log("FCM TOKEN: $token");
      log("=========================================");
    } catch (e) {
      log("Lỗi lấy FCM Token: $e");
    }

    // 4. Listen to Foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      log("Nhận thông báo ở chế độ mở (Foreground): ${message.notification?.title} - ${message.notification?.body}");
    });

    // 5. Handle app opening from background when clicking on notification
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      log("Ứng dụng được mở từ thông báo: ${message.data}");
    });
  }
}
