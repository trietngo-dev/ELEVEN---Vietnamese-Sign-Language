import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConstants {
  // Configured to dynamically resolve host IP for Emulator vs Web/Devices
  static String get baseUrl {
    if (kIsWeb) {
      return "http://localhost:5000";
    }
    // For Android Emulator, 10.0.2.2 points to the host's localhost loopback
    if (Platform.isAndroid) {
      return "http://10.0.97.69:5000";
    }
    return "http://localhost:5000";
  }

  static String get login => "$baseUrl/api/users/login";
  static String get register => "$baseUrl/api/users/register";
  static String get courses => "$baseUrl/api/courses";
  static String get lessons => "$baseUrl/api/lessons";
  static String get predictGesture => "$baseUrl/api/gesture/predict";
  static String get translateSentence => "$baseUrl/api/gesture/translate-sentence";
  static String get feedbacks => "$baseUrl/api/feedbacks";
  static String get feedbackCategories => "$baseUrl/api/feedback_categories";
  static String get userNotifications => "$baseUrl/api/notifications/user";
}
