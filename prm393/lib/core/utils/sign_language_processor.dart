import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart'
    show InputImage;

class SignLanguageProcessor {
  bool _isProcessing = false;
  bool _isNativeInitialized = false;
  Future<void>? _initializationFuture;
  List<double>? latestCroppedFeatures;
  static const MethodChannel _platformChannel = MethodChannel(
    'com.eleven.vsl/hand_tracker',
  );

  SignLanguageProcessor();

  Future<void> initialize() {
    if (defaultTargetPlatform != TargetPlatform.android ||
        _isNativeInitialized) {
      return Future.value();
    }

    return _initializationFuture ??= _initializeNative();
  }

  Future<void> _initializeNative() async {
    try {
      await _platformChannel.invokeMethod('initializeHolistic');
      _isNativeInitialized = true;
    } catch (e) {
      debugPrint("Native holistic initialization error: $e");
      rethrow;
    } finally {
      _initializationFuture = null;
    }
  }

  Future<List<double>> processImage(InputImage inputImage) async {
    if (_isProcessing) return [];
    _isProcessing = true;

    try {
      // Call native MethodChannel for MediaPipe Holistic Tracking (only on Android)
      List<double> holisticFeatures = List.generate(306, (_) => 0.0);
      if (defaultTargetPlatform == TargetPlatform.android &&
          inputImage.bytes != null) {
        try {
          await initialize();
          final List<dynamic>? nativeResult = await _platformChannel
              .invokeMethod('processFrame', {
            'bytes': inputImage.bytes,
            'width': inputImage.metadata?.size.width.toInt(),
            'height': inputImage.metadata?.size.height.toInt(),
          });
          if (nativeResult != null) {
            holisticFeatures = nativeResult.cast<double>();
          }
        } catch (e) {
          debugPrint("Lỗi native holistic tracking: $e");
        }
      }

      _isProcessing = false;

      // Save raw features before spatial normalization for live skeletal visual overlay
      latestCroppedFeatures = List<double>.from(holisticFeatures);

      // Spatial Normalization relative to Nose (index 0, 1, 2)
      if (holisticFeatures.isNotEmpty) {
        final noseX = holisticFeatures[0];
        final noseY = holisticFeatures[1];
        final noseZ = holisticFeatures[2];

        if (noseX != 0.0 || noseY != 0.0 || noseZ != 0.0) {
          for (int i = 0; i < holisticFeatures.length; i += 3) {
            if (holisticFeatures[i] != 0.0 ||
                holisticFeatures[i + 1] != 0.0 ||
                holisticFeatures[i + 2] != 0.0) {
              holisticFeatures[i] -= noseX;
              holisticFeatures[i + 1] -= noseY;
              // Khôi phục tỉ lệ 1:1 cho trục Y từ khung hình 3:4
              holisticFeatures[i + 1] *= 1.3333333;
              holisticFeatures[i + 2] -= noseZ;
            }
          }
        }
      }

      return holisticFeatures;
    } catch (e) {
      _isProcessing = false;
      debugPrint("Lỗi phân tích hình ảnh: $e");
      return [];
    }
  }

  void close() {
    if (defaultTargetPlatform != TargetPlatform.android) {
      return;
    }

    _isNativeInitialized = false;
    final initializationFuture = _initializationFuture;
    if (initializationFuture != null) {
      initializationFuture.whenComplete(_closeNative);
    } else {
      _closeNative();
    }
  }

  void _closeNative() {
    _platformChannel.invokeMethod('closeHolistic').catchError((Object e) {
      debugPrint("Native holistic close error: $e");
    });
  }
}
