import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';

class SignLanguageProcessor {
  late final PoseDetector _poseDetector;
  late final FaceDetector _faceDetector;
  bool _isProcessing = false;
  List<double>? latestCroppedFeatures;
  static const MethodChannel _platformChannel = MethodChannel('com.eleven.vsl/hand_tracker');

  SignLanguageProcessor() {
    // 1. Initialize ML Kit detectors with optimized on-device settings
    _poseDetector = PoseDetector(
      options: PoseDetectorOptions(
        model: PoseDetectionModel.base,
        mode: PoseDetectionMode.stream,
      ),
    );

    _faceDetector = FaceDetector(
      options: FaceDetectorOptions(
        enableContours: true, // Required for lip/eyebrow contour points mapping
        enableClassification: false,
        performanceMode: FaceDetectorMode.fast,
      ),
    );
  }

  Future<List<double>> processImage(InputImage inputImage) async {
    if (_isProcessing) return [];
    _isProcessing = true;

    try {
      // 2. Run Pose and Face detection concurrently
      final poseFuture = _poseDetector.processImage(inputImage);
      final faceFuture = _faceDetector.processImage(inputImage);

      // Call native MethodChannel for MediaPipe Hand Tracking (only on Android)
      List<double> handLandmarks = List.generate(126, (_) => 0.0);
      if (defaultTargetPlatform == TargetPlatform.android && inputImage.bytes != null) {
        try {
          final List<dynamic>? nativeResult = await _platformChannel.invokeMethod('processFrame', {
            'bytes': inputImage.bytes,
            'width': inputImage.metadata?.size.width.toInt(),
            'height': inputImage.metadata?.size.height.toInt(),
          });
          if (nativeResult != null) {
            handLandmarks = nativeResult.cast<double>();
          }
        } catch (e) {
          debugPrint("Lỗi native hand tracking: $e");
        }
      }

      final results = await Future.wait([poseFuture, faceFuture]);
      final poses = results[0] as List<Pose>;
      final faces = results[1] as List<Face>;

      _isProcessing = false;
      
      return _extract102Keypoints(poses, faces, inputImage, handLandmarks);
    } catch (e) {
      _isProcessing = false;
      debugPrint("Lỗi phân tích hình ảnh: $e");
      return [];
    }
  }

  List<double> _extract102Keypoints(List<Pose> poses, List<Face> faces, InputImage inputImage, List<double> handLandmarks) {
    final List<double> flatFeatures = [];

    final rawWidth = inputImage.metadata?.size.width ?? 0.0;
    final rawHeight = inputImage.metadata?.size.height ?? 0.0;
    final rotation = inputImage.metadata?.rotation ?? InputImageRotation.rotation0deg;

    // If image is rotated portrait (90 or 270 degrees), the active coordinate axes are swapped
    final isSwapped = rotation == InputImageRotation.rotation90deg ||
                      rotation == InputImageRotation.rotation270deg;

    final width = isSwapped ? rawHeight : rawWidth;
    final height = isSwapped ? rawWidth : rawHeight;

    // Helper to push coordinates safely, matching the python training square-crop space
    void pushPoint(double x, double y, double z) {
      if (width > 0 && height > 0) {
        final minDim = min(width, height);
        final startX = (width - minDim) / 2.0;
        final startY = (height - minDim) / 2.0;
        
        final xPixel = x; // ML Kit coordinates are already in absolute pixels
        final yPixel = y;
        
        final xCropped = (xPixel - startX) / minDim;
        final yCropped = (yPixel - startY) / minDim;
        
        flatFeatures.add(xCropped);
        flatFeatures.add(yCropped);
        flatFeatures.add(z);
      } else {
        flatFeatures.add(x);
        flatFeatures.add(y);
        flatFeatures.add(z);
      }
    }

    // 1. Pose (9 selected points -> 27 floats)
    // Selected indices: 0 (nose), 11 (L shoulder), 12 (R shoulder), 13 (L elbow), 14 (R elbow), 15 (L wrist), 16 (R wrist), 23 (L hip), 24 (R hip)
    if (poses.isNotEmpty) {
      final pose = poses.first;
      final selectedLandmarks = [
        pose.landmarks[PoseLandmarkType.nose],
        pose.landmarks[PoseLandmarkType.leftShoulder],
        pose.landmarks[PoseLandmarkType.rightShoulder],
        pose.landmarks[PoseLandmarkType.leftElbow],
        pose.landmarks[PoseLandmarkType.rightElbow],
        pose.landmarks[PoseLandmarkType.leftWrist],
        pose.landmarks[PoseLandmarkType.rightWrist],
        pose.landmarks[PoseLandmarkType.leftHip],
        pose.landmarks[PoseLandmarkType.rightHip],
      ];

      for (final lm in selectedLandmarks) {
        if (lm != null) {
          pushPoint(lm.x, lm.y, lm.z);
        } else {
          pushPoint(0.0, 0.0, 0.0);
        }
      }
    } else {
      for (int i = 0; i < 9; i++) {
        pushPoint(0.0, 0.0, 0.0);
      }
    }

    // 2. Face (51 selected points -> 153 floats)
    // Extracting mouth and eyebrow contours matching the 51 selected indices on web
    if (faces.isNotEmpty) {
      final face = faces.first;
      final List<Point<int>> facePoints = [];
      
      // Accumulate mouth and eyebrow contour points
      final upperLip = face.contours[FaceContourType.upperLipTop]?.points;
      if (upperLip != null) facePoints.addAll(upperLip);
      
      final lowerLip = face.contours[FaceContourType.lowerLipBottom]?.points;
      if (lowerLip != null) facePoints.addAll(lowerLip);

      final leftEyebrow = face.contours[FaceContourType.leftEyebrowTop]?.points;
      if (leftEyebrow != null) facePoints.addAll(leftEyebrow);

      final rightEyebrow = face.contours[FaceContourType.rightEyebrowTop]?.points;
      if (rightEyebrow != null) facePoints.addAll(rightEyebrow);

      // Ensure we fill exactly 51 points
      for (int i = 0; i < 51; i++) {
        if (i < facePoints.length) {
          final pt = facePoints[i];
          pushPoint(pt.x.toDouble(), pt.y.toDouble(), 0.0); // Z is 0 for face contours
        } else {
          pushPoint(0.0, 0.0, 0.0);
        }
      }
    } else {
      for (int i = 0; i < 51; i++) {
        pushPoint(0.0, 0.0, 0.0);
      }
    }

    // 3. Left Hand (21 points -> 63 floats) & 4. Right Hand (21 points -> 63 floats)
    // Extract them from handLandmarks returned from native MediaPipe JNI
    for (int i = 0; i < 42; i++) {
      final double hx = handLandmarks[i * 3];
      final double hy = handLandmarks[i * 3 + 1];
      final double hz = handLandmarks[i * 3 + 2];
      
      // hx and hy are normalized relative to the raw frame dimensions.
      // We convert them back to absolute pixel coordinates so they can be cropped
      // and normalized inside pushPoint in perfect alignment with Pose and Face!
      if (hx != 0.0 || hy != 0.0 || hz != 0.0) {
        final double rawWidth = inputImage.metadata?.size.width ?? 0.0;
        final double rawHeight = inputImage.metadata?.size.height ?? 0.0;
        
        final double xPixel = hx * rawWidth;
        final double yPixel = hy * rawHeight;
        
        pushPoint(xPixel, yPixel, hz);
      } else {
        pushPoint(0.0, 0.0, 0.0);
      }
    }

    // Save raw cropped features before nose-relative normalization for live skeletal visual overlay
    latestCroppedFeatures = List<double>.from(flatFeatures);

    // Spatial Normalization relative to Nose (index 0, 1, 2)
    if (flatFeatures.isNotEmpty) {
      final noseX = flatFeatures[0];
      final noseY = flatFeatures[1];
      final noseZ = flatFeatures[2];
      
      if (noseX != 0.0 || noseY != 0.0 || noseZ != 0.0) {
        for (int i = 0; i < flatFeatures.length; i += 3) {
          if (flatFeatures[i] != 0.0 || flatFeatures[i + 1] != 0.0 || flatFeatures[i + 2] != 0.0) {
            flatFeatures[i] -= noseX;
            flatFeatures[i + 1] -= noseY;
            flatFeatures[i + 2] -= noseZ;
          }
        }
      }
    }

    return flatFeatures;
  }

  void close() {
    _poseDetector.close();
    _faceDetector.close();
  }
}
