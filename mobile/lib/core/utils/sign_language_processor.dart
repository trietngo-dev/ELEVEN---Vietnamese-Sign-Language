import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart' show InputImage;

class SignLanguageProcessor {
  bool _isProcessing = false;
  List<double>? latestCroppedFeatures;
  static const MethodChannel _platformChannel = MethodChannel('com.eleven.vsl/hand_tracker');

  static const List<int> _selectedPoseIndices = [0, 11, 12, 13, 14, 15, 16, 23, 24];
  static const List<int> _selectedFaceIndices = [
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317,
    14, 87, 178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 46, 53, 52,
    65, 55, 70, 63, 105, 66, 107, 276, 283, 282, 295, 285, 300, 293, 334, 296,
    336
  ];

  SignLanguageProcessor();

  Future<List<double>> processImage(InputImage inputImage) async {
    if (_isProcessing) return [];
    _isProcessing = true;

    try {
      // Receive full 1629 floats (33 Pose, 468 Face, 21 L Hand, 21 R Hand)
      List<double> rawFeatures = List.generate(1629, (_) => 0.0);
      if (defaultTargetPlatform == TargetPlatform.android && inputImage.bytes != null) {
        try {
          final List<dynamic>? nativeResult = await _platformChannel.invokeMethod('processFrame', {
            'bytes': inputImage.bytes,
            'width': inputImage.metadata?.size.width.toInt(),
            'height': inputImage.metadata?.size.height.toInt(),
          });
          if (nativeResult != null) {
            rawFeatures = nativeResult.cast<double>();
          }
        } catch (e) {
          debugPrint("Lỗi native holistic tracking: $e");
        }
      }

      _isProcessing = false;

      // Save full features (1629 floats) for visualization in UI (mirrored view)
      latestCroppedFeatures = List<double>.from(rawFeatures);

      // Extract the 306 features needed for backend model input
      final List<double> modelInput = [];

      // Helper to add a 3D point (x, y, z) by its index in the raw features category
      void addPoint(int categoryOffset, int pointIndex) {
        final startIdx = categoryOffset + pointIndex * 3;
        if (startIdx + 2 < rawFeatures.length) {
          modelInput.add(rawFeatures[startIdx]);
          modelInput.add(rawFeatures[startIdx + 1]);
          modelInput.add(rawFeatures[startIdx + 2]);
        } else {
          modelInput.addAll([0.0, 0.0, 0.0]);
        }
      }

      // Offsets in rawFeatures:
      // Pose starts at 0 (size: 33 * 3 = 99)
      // Face starts at 99 (size: 468 * 3 = 1404)
      // Left Hand starts at 99 + 1404 = 1503 (size: 21 * 3 = 63)
      // Right Hand starts at 1503 + 63 = 1566 (size: 21 * 3 = 63)
      const int poseOffset = 0;
      const int faceOffset = 99;
      const int leftHandOffset = 1503;
      const int rightHandOffset = 1566;

      // 1. Pose (9 selected points -> 27 floats)
      for (final idx in _selectedPoseIndices) {
        addPoint(poseOffset, idx);
      }

      // 2. Face (51 selected points -> 153 floats)
      for (final idx in _selectedFaceIndices) {
        addPoint(faceOffset, idx);
      }

      // 3. Left Hand (21 points -> 63 floats)
      for (int i = 0; i < 21; i++) {
        addPoint(leftHandOffset, i);
      }

      // 4. Right Hand (21 points -> 63 floats)
      for (int i = 0; i < 21; i++) {
        addPoint(rightHandOffset, i);
      }

      // Spatial Normalization relative to Nose (index 0, 1, 2 of modelInput)
      if (modelInput.isNotEmpty) {
        final noseX = modelInput[0];
        final noseY = modelInput[1];
        final noseZ = modelInput[2];
        
        if (noseX != 0.0 || noseY != 0.0 || noseZ != 0.0) {
          for (int i = 0; i < modelInput.length; i += 3) {
            if (modelInput[i] != 0.0 || modelInput[i + 1] != 0.0 || modelInput[i + 2] != 0.0) {
              modelInput[i] -= noseX;
              modelInput[i + 1] -= noseY;
              modelInput[i + 2] -= noseZ;
            }
          }
        }
      }

      return modelInput;
    } catch (e) {
      _isProcessing = false;
      debugPrint("Lỗi phân tích hình ảnh: $e");
      return [];
    }
  }

  void close() {}
}
