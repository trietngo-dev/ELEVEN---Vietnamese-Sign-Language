import 'package:dio/dio.dart';

class ErrorHandler {
  /// Safely extracts a user-friendly error message from a DioException.
  /// Prevents crashes such as `type 'String' is not a subtype of type 'int' of 'index'`.
  static String getDioErrorMessage(dynamic e, String defaultMessage) {
    if (e is DioException) {
      final data = e.response?.data;
      if (data is Map) {
        return data['message']?.toString() ?? data['Message']?.toString() ?? defaultMessage;
      } else if (data is String && data.trim().isNotEmpty) {
        final trimmed = data.trim();
        // If it looks like HTML, it is probably a server crash/maintenance page, so use default message
        if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
          return defaultMessage;
        }
        return trimmed;
      }
    }
    return defaultMessage;
  }
}
