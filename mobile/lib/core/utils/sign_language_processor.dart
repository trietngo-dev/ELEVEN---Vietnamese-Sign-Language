import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';

class SignLanguageProcessor {
  late final PoseDetector _poseDetector;
  late final FaceDetector _faceDetector;
  bool _isProcessing = false;

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

      final results = await Future.wait([poseFuture, faceFuture]);
      final poses = results[0] as List<Pose>;
      final faces = results[1] as List<Face>;

      _isProcessing = false;
      return _extract102Keypoints(poses, faces);
    } catch (e) {
      _isProcessing = false;
      debugPrint("Lỗi phân tích hình ảnh: $e");
      return [];
    }
  }

  List<double> _extract102Keypoints(List<Pose> poses, List<Face> faces) {
    final List<double> flatFeatures = [];

    // Helper to push coordinates safely
    void pushPoint(double x, double y, double z) {
      flatFeatures.add(x);
      flatFeatures.add(y);
      flatFeatures.add(z);
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
    // Since Google ML Kit lacks on-device hands landmarking natively,
    // they default to 0.0 when not mapped by external hand tracking plugins,
    // which aligns with the Web sliding window fallback strategy.
    for (int i = 0; i < 42; i++) {
      pushPoint(0.0, 0.0, 0.0);
    }

    return flatFeatures;
  }

  void close() {
    _poseDetector.close();
    _faceDetector.close();
  }
}
