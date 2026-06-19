import 'package:flutter/foundation.dart';

class ApiConstants {
  static const String _apiBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_apiBaseUrl.isNotEmpty) {
      return _apiBaseUrl;
    }

    if (kIsWeb) {
      return "http://localhost:5000";
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return "http://10.0.2.2:5000";
    }

    return "http://localhost:5000";
  }

  static String get login => "$baseUrl/api/users/login";
  static String get register => "$baseUrl/api/users/register";
}
