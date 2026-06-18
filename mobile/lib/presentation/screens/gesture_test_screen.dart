import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/datasources/course_data_source.dart';
import '../../data/models/lesson_model.dart';
import '../../core/utils/sign_language_processor.dart';
import '../bloc/gesture_bloc.dart';
import '../../core/theme/app_theme.dart';

class GestureTestScreen extends StatefulWidget {
  final LessonModel lesson;

  const GestureTestScreen({super.key, required this.lesson});

  @override
  State<GestureTestScreen> createState() => _GestureTestScreenState();
}

class _GestureTestScreenState extends State<GestureTestScreen>
    with WidgetsBindingObserver {
  CameraController? _cameraController;
  final SignLanguageProcessor _processor = SignLanguageProcessor();
  bool _isCameraInitialized = false;
  bool _isCollecting = false;
  int _capturedFrames = 0;
  List<String> _words = [];
  String _finalSentence = 'Câu hoàn chỉnh sẽ hiển thị tại đây!';
  String _status = 'Sẵn sàng kiểm tra cử chỉ';
  List<double>? _latestFeatures;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(_initializeHolistic());
    _initializeCamera();
    context.read<GestureBloc>().add(GestureSessionReset());
  }

  Future<void> _initializeHolistic() async {
    try {
      await _processor.initialize();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _status = 'Loi khoi tao AI: $e';
      });
    }
  }

  Future<void> _initializeCamera() async {
    try {
      final cameras = await availableCameras();
      // Find selfie camera (front-facing)
      final frontCamera = cameras.firstWhere(
        (cam) => cam.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _cameraController = CameraController(
        frontCamera,
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: defaultTargetPlatform == TargetPlatform.android
            ? ImageFormatGroup.nv21
            : ImageFormatGroup.bgra8888,
      );

      await _cameraController!.initialize();
      if (!mounted) return;

      setState(() {
        _isCameraInitialized = true;
      });

      _startImageStream();
    } catch (e) {
      setState(() {
        _status = 'Lỗi khởi tạo camera: $e';
      });
    }
  }

  void _startImageStream() {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    _cameraController!.startImageStream((CameraImage image) async {
      if (!_isCollecting) return;

      // Convert CameraImage to ML Kit InputImage
      final inputImage = _convertCameraImage(image);
      if (inputImage == null) return;

      final features = await _processor.processImage(inputImage);
      if (features.isNotEmpty && mounted) {
        final rawFeatures = _processor.latestCroppedFeatures;
        if (rawFeatures != null) {
          if (_latestFeatures == null ||
              _latestFeatures!.length != rawFeatures.length) {
            _latestFeatures = List<double>.from(rawFeatures);
          } else {
            const double alpha = 0.35; // EMA smoothing factor
            for (int i = 0; i < rawFeatures.length; i += 3) {
              if (i + 2 < rawFeatures.length) {
                final double curX = rawFeatures[i];
                final double curY = rawFeatures[i + 1];
                final double curZ = rawFeatures[i + 2];

                final double prevX = _latestFeatures![i];
                final double prevY = _latestFeatures![i + 1];
                final double prevZ = _latestFeatures![i + 2];

                // Nếu điểm hiện tại không được nhận diện, ẩn ngay lập tức (về 0)
                if (curX == 0.0 && curY == 0.0) {
                  _latestFeatures![i] = 0.0;
                  _latestFeatures![i + 1] = 0.0;
                  _latestFeatures![i + 2] = 0.0;
                }
                // Nếu điểm trước đó bằng 0 (vừa xuất hiện lại), nhảy ngay tới điểm mới thay vì lướt từ góc màn hình
                else if (prevX == 0.0 && prevY == 0.0) {
                  _latestFeatures![i] = curX;
                  _latestFeatures![i + 1] = curX != 0.0 ? curY : 0.0;
                  _latestFeatures![i + 2] = curX != 0.0 ? curZ : 0.0;
                }
                // Nếu cả hai đều hợp lệ, làm mịn bằng EMA
                else {
                  _latestFeatures![i] = alpha * curX + (1.0 - alpha) * prevX;
                  _latestFeatures![i + 1] =
                      alpha * curY + (1.0 - alpha) * prevY;
                  _latestFeatures![i + 2] =
                      alpha * curZ + (1.0 - alpha) * prevZ;
                }
              }
            }
          }
        }
        setState(() {});
        context.read<GestureBloc>().add(GestureFrameCaptured(features));
      }
    });
  }

  InputImage? _convertCameraImage(CameraImage image) {
    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        final width = image.width;
        final height = image.height;

        final yPlane = image.planes[0];
        final yBytes = yPlane.bytes;

        // NV21 format: YYYYYYYY VUVU...
        final nv21 = Uint8List(width * height + (width * height ~/ 2));

        // 1. Copy Y plane removing any rowStride padding
        final yRowStride = yPlane.bytesPerRow;
        if (yRowStride == width) {
          nv21.setRange(0, width * height, yBytes);
        } else {
          for (int h = 0; h < height; h++) {
            nv21.setRange(h * width, (h + 1) * width, yBytes, h * yRowStride);
          }
        }

        // 2. Copy and interleave U and V planes
        final uvOffset = width * height;
        if (image.planes.length == 2) {
          final vuPlane = image.planes[1];
          final vuBytes = vuPlane.bytes;
          final vuRowStride = vuPlane.bytesPerRow;
          final uvHeight = height ~/ 2;

          if (vuRowStride == width) {
            nv21.setRange(uvOffset, uvOffset + width * uvHeight, vuBytes);
          } else {
            for (int h = 0; h < uvHeight; h++) {
              nv21.setRange(
                uvOffset + h * width,
                uvOffset + (h + 1) * width,
                vuBytes,
                h * vuRowStride,
              );
            }
          }
        } else if (image.planes.length == 3) {
          final uPlane = image.planes[1];
          final vPlane = image.planes[2];

          final uBytes = uPlane.bytes;
          final vBytes = vPlane.bytes;

          final uRowStride = uPlane.bytesPerRow;
          final vRowStride = vPlane.bytesPerRow;

          final uPixelStride = uPlane.bytesPerPixel ?? 1;
          final vPixelStride = vPlane.bytesPerPixel ?? 1;

          final uvWidth = width ~/ 2;
          final uvHeight = height ~/ 2;

          int dstIdx = uvOffset;

          for (int h = 0; h < uvHeight; h++) {
            for (int w = 0; w < uvWidth; w++) {
              final uIdx = h * uRowStride + w * uPixelStride;
              final vIdx = h * vRowStride + w * vPixelStride;

              nv21[dstIdx++] = vBytes[vIdx];
              nv21[dstIdx++] = uBytes[uIdx];
            }
          }
        }

        final Size imageSize = Size(width.toDouble(), height.toDouble());
        final inputImageMetadata = InputImageMetadata(
          size: imageSize,
          rotation: InputImageRotation.rotation270deg,
          format: InputImageFormat.nv21,
          bytesPerRow: width, // No padding in our custom packed NV21 buffer
        );

        return InputImage.fromBytes(bytes: nv21, metadata: inputImageMetadata);
      } else {
        // iOS or other platforms (BGRA8888)
        final WriteBuffer allBytes = WriteBuffer();
        for (final Plane plane in image.planes) {
          allBytes.putUint8List(plane.bytes);
        }
        final bytes = allBytes.done().buffer.asUint8List();

        final Size imageSize = Size(
          image.width.toDouble(),
          image.height.toDouble(),
        );
        final inputImageMetadata = InputImageMetadata(
          size: imageSize,
          rotation: InputImageRotation.rotation270deg,
          format: InputImageFormat.bgra8888,
          bytesPerRow: image.planes[0].bytesPerRow,
        );

        return InputImage.fromBytes(bytes: bytes, metadata: inputImageMetadata);
      }
    } catch (e) {
      debugPrint("Lỗi chuyển đổi ảnh: $e");
      return null;
    }
  }

  void _toggleCollection() {
    final gestureBloc = context.read<GestureBloc>();
    if (_isCollecting) {
      setState(() {
        _isCollecting = false;
        _latestFeatures = null;
        _status = 'Đang hoàn tất và trau chuốt bằng Gemini...';
      });
      gestureBloc.add(GesturePolishRequested());
    } else {
      setState(() {
        _isCollecting = true;
        _latestFeatures = null;
        _capturedFrames = 0;
        _words.clear();
        _finalSentence = '';
        _status = 'Đang lắng nghe cử chỉ của bạn...';
      });
      gestureBloc.add(GestureSessionReset());
    }
  }

  Future<void> _completeLessonProgress() async {
    final courseDs = context.read<CourseDataSource>();
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getInt('auth_user_id') ?? 1;

    final success = await courseDs.completeLesson(
      userId: userId,
      lessonId: widget.lesson.id,
      accuracy: 95.0, // AI Score matching LSTM accuracy fallback
      xpEarned: widget.lesson.xpEarned,
    );

    if (success && mounted) {
      // Save local progress and XP
      final currentXp = prefs.getInt('auth_user_xp') ?? 100;
      await prefs.setInt('auth_user_xp', currentXp + widget.lesson.xpEarned);

      // Save AI completion flag and update daily challenge progress
      await prefs.setBool('ai_completed_${widget.lesson.id}', true);
      final dailyCount = prefs.getInt('daily_challenge_count') ?? 2;
      if (dailyCount < 5) {
        await prefs.setInt('daily_challenge_count', dailyCount + 1);
      }

      _showCompletionDialog();
    }
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          title: const Text(
            "Chúc Mừng!",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryColor,
            ),
            textAlign: TextAlign.center,
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.stars_rounded, size: 72, color: Colors.amber),
              const SizedBox(height: 16),
              Text(
                "Bạn đã hoàn thành bài học \"${widget.lesson.title}\" xuất sắc và nhận được +${widget.lesson.xpEarned} XP điểm thưởng!",
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ],
          ),
          actionsAlignment: MainAxisAlignment.center,
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Dismiss Dialog
                Navigator.of(context).pop(); // Return to Lesson Detail
              },
              child: const Text("Tuyệt vời"),
            ),
          ],
        );
      },
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final CameraController? cameraController = _cameraController;

    if (cameraController == null || !cameraController.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.inactive) {
      cameraController.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initializeCamera();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    _processor.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text("Kiểm Tra AI")),
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.bgGradient),
        child: BlocConsumer<GestureBloc, GestureState>(
          listener: (context, state) {
            if (state is GesturePredictionSuccess) {
              setState(() {
                _words = state.recognizedWords;
                _capturedFrames = state.capturedFrames;
                _status = 'Đã nhận dạng: ${state.predictedWord}';
              });
            } else if (state is GestureBufferUpdating) {
              setState(() {
                _capturedFrames = state.capturedFrames;
                _words = state.recognizedWords;
              });
            } else if (state is GestureTranslationSuccess) {
              setState(() {
                _finalSentence = state.finalSentence;
                _status = 'Đã dịch xong câu!';
              });
              _completeLessonProgress();
            } else if (state is GestureFailure) {
              setState(() {
                _status = 'Lỗi dịch thuật: ${state.error}';
              });
            }
          },
          builder: (context, state) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. Camera Viewport
                  AspectRatio(
                    aspectRatio:
                        3 /
                        4, // 3:4 aspect ratio to display the full vertical portrait frame
                    child: Card(
                      clipBehavior: Clip.antiAlias,
                      margin: EdgeInsets.zero,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          _isCameraInitialized
                              ? CameraPreview(_cameraController!)
                              : const Center(
                                  child: CircularProgressIndicator(),
                                ),

                          // Futuristic Half-Body Guide Overlay
                          Positioned.fill(
                            child: CustomPaint(painter: HalfBodyGuidePainter()),
                          ),

                          // Live skeletal & facial landmarks overlay (Khung Landmark)
                          if (_isCollecting && _latestFeatures != null)
                            Positioned.fill(
                              child: CustomPaint(
                                painter: LandmarksPainter(
                                  features: _latestFeatures!,
                                ),
                              ),
                            ),

                          // Countdown timer overlay
                          if (_isCollecting)
                            Positioned(
                              top: 16,
                              right: 16,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.redAccent,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.radio_button_checked_rounded,
                                      color: Colors.white,
                                      size: 14,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      "Ghi: $_capturedFrames/50",
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // 2. Control Button
                  ElevatedButton(
                    onPressed: _isCameraInitialized ? _toggleCollection : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isCollecting
                          ? Colors.amber[700]
                          : theme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(
                      _isCollecting
                          ? "Kết Thúc & Trau Chuốt"
                          : "Bắt Đầu Dịch Cử Chỉ",
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 3. Translation Output Feed
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "Từ vựng nhận diện được",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _words.isEmpty
                                ? [
                                    Text(
                                      _isCollecting
                                          ? "Đang lắng nghe..."
                                          : "Chưa có từ nào",
                                      style: const TextStyle(
                                        fontStyle: FontStyle.italic,
                                        color: Colors.grey,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ]
                                : _words
                                      .map(
                                        (w) => Chip(
                                          label: Text(
                                            w,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: AppTheme.primaryColor,
                                              fontSize: 12,
                                            ),
                                          ),
                                          backgroundColor:
                                              AppTheme.primarySubtle,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                          ),
                                          side: BorderSide.none,
                                        ),
                                      )
                                      .toList(),
                          ),
                          const Divider(height: 32, color: Color(0xFFEDF6E4)),
                          const Text(
                            "Câu dịch hoàn chỉnh",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _finalSentence,
                            style: theme.textTheme.headlineLarge?.copyWith(
                              fontSize: 22,
                              color: const Color(0xFF202734),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            "Trạng thái: $_status",
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class HalfBodyGuidePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    final dashPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // Draw Head Outline (Oval in top-middle)
    final headCenter = Offset(size.width / 2, size.height * 0.28);
    final headRadiusX = size.width * 0.16;
    final headRadiusY = size.height * 0.18;
    canvas.drawOval(
      Rect.fromCenter(
        center: headCenter,
        width: headRadiusX * 2,
        height: headRadiusY * 2,
      ),
      paint,
    );

    // Draw Shoulders (Arc below head)
    final shoulderPath = Path()
      ..moveTo(size.width * 0.15, size.height * 0.8)
      ..quadraticBezierTo(
        size.width * 0.15,
        size.height * 0.52,
        size.width * 0.32,
        size.height * 0.52,
      )
      ..lineTo(size.width * 0.68, size.height * 0.52)
      ..quadraticBezierTo(
        size.width * 0.85,
        size.height * 0.52,
        size.width * 0.85,
        size.height * 0.8,
      );
    canvas.drawPath(shoulderPath, paint);

    // Draw Hand Capture zones (Left and Right dashed boxes)
    // Left hand zone
    final leftHandRect = Rect.fromLTWH(
      size.width * 0.08,
      size.height * 0.54,
      size.width * 0.22,
      size.height * 0.22,
    );
    _drawDashedRect(canvas, leftHandRect, dashPaint);

    // Right hand zone
    final rightHandRect = Rect.fromLTWH(
      size.width * 0.70,
      size.height * 0.54,
      size.width * 0.22,
      size.height * 0.22,
    );
    _drawDashedRect(canvas, rightHandRect, dashPaint);
  }

  void _drawDashedRect(Canvas canvas, Rect rect, Paint paint) {
    const double dashWidth = 8;
    const double dashSpace = 4;

    // Top line
    double startX = rect.left;
    while (startX < rect.right) {
      canvas.drawLine(
        Offset(startX, rect.top),
        Offset(startX + dashWidth, rect.top),
        paint,
      );
      startX += dashWidth + dashSpace;
    }
    // Bottom line
    startX = rect.left;
    while (startX < rect.right) {
      canvas.drawLine(
        Offset(startX, rect.bottom),
        Offset(startX + dashWidth, rect.bottom),
        paint,
      );
      startX += dashWidth + dashSpace;
    }
    // Left line
    double startY = rect.top;
    while (startY < rect.bottom) {
      canvas.drawLine(
        Offset(rect.left, startY),
        Offset(rect.left, startY + dashWidth),
        paint,
      );
      startY += dashWidth + dashSpace;
    }
    // Right line
    startY = rect.top;
    while (startY < rect.bottom) {
      canvas.drawLine(
        Offset(rect.right, startY),
        Offset(rect.right, startY + dashWidth),
        paint,
      );
      startY += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class LandmarksPainter extends CustomPainter {
  final List<double> features;

  LandmarksPainter({required this.features});

  @override
  void paint(Canvas canvas, Size size) {
    if (features.length < 306) return;

    final paintJoint = Paint()
      ..color =
          const Color(0xFF00FFCC) // Neon teal
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final paintDot = Paint()
      ..color = const Color(0xFF00FFCC)
      ..style = PaintingStyle.fill;

    /*
    final paintFace = Paint()
      ..color = Colors.amberAccent.withValues(alpha: 0.85) // Premium warm amber dots
      ..style = PaintingStyle.fill;
    */

    final paintHandJoint = Paint()
      ..color =
          const Color(0xFFFF2A85) // Hot neon pink for hands
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final paintHandDot = Paint()
      ..color =
          const Color(0xFFFF5EA2) // Bright pink for hand joints
      ..style = PaintingStyle.fill;

    // Helper to get Offset for keypoint index
    Offset? getPoint(int index) {
      final int start = index * 3;
      final double x = features[start];
      final double y = features[start + 1];

      // If point is empty/un-detected
      if (x == 0.0 && y == 0.0) return null;

      // The native camera frame is already rotated and flipped (mirrored) in Kotlin,
      // so we map coordinates directly without subtracting from 1.0!
      final double drawX = x * size.width;
      final double drawY = y * size.height;
      return Offset(drawX, drawY);
    }

    // 1. Draw Pose Joints (9 selected points, upper body only)
    final nose = getPoint(0);
    final lShoulder = getPoint(1);
    final rShoulder = getPoint(2);
    final lElbow = getPoint(3);
    final rElbow = getPoint(4);
    final lWrist = getPoint(5);
    final rWrist = getPoint(6);
    final lHip = getPoint(7);
    final rHip = getPoint(8);

    // Draw connection lines
    void drawLine(Offset? p1, Offset? p2) {
      if (p1 != null && p2 != null) {
        canvas.drawLine(p1, p2, paintJoint);
      }
    }

    drawLine(lShoulder, rShoulder);
    drawLine(lShoulder, lElbow);
    drawLine(lElbow, lWrist);
    drawLine(rShoulder, rElbow);
    drawLine(rElbow, rWrist);
    drawLine(lShoulder, lHip);
    drawLine(rShoulder, rHip);
    drawLine(lHip, rHip);

    // Draw Pose dots
    final posePoints = [
      nose,
      lShoulder,
      rShoulder,
      lElbow,
      rElbow,
      lWrist,
      rWrist,
      lHip,
      rHip,
    ];
    for (final pt in posePoints) {
      if (pt != null) {
        canvas.drawCircle(pt, 5.0, paintDot);
      }
    }

    // 2. Draw Face Contours (51 selected points, indices 9 to 59) - Disabled in UI for cleaner preview
    /*
    for (int i = 9; i < 60; i++) {
      final pt = getPoint(i);
      if (pt != null) {
        canvas.drawCircle(pt, 2.0, paintFace);
      }
    }
    */

    // 3. Draw Hands Skeleton (Left Hand at index 60, Right Hand at index 81)
    void drawHand(int baseIndex) {
      final wrist = getPoint(baseIndex + 0);

      final thumb = List.generate(4, (i) => getPoint(baseIndex + 1 + i));
      final indexFinger = List.generate(4, (i) => getPoint(baseIndex + 5 + i));
      final middleFinger = List.generate(4, (i) => getPoint(baseIndex + 9 + i));
      final ringFinger = List.generate(4, (i) => getPoint(baseIndex + 13 + i));
      final pinkyFinger = List.generate(4, (i) => getPoint(baseIndex + 17 + i));

      void drawFinger(Offset? start, List<Offset?> finger) {
        Offset? prev = start;
        for (final pt in finger) {
          if (prev != null && pt != null) {
            canvas.drawLine(prev, pt, paintHandJoint);
          }
          prev = pt;
        }
      }

      drawFinger(wrist, thumb);
      drawFinger(wrist, indexFinger);
      drawFinger(wrist, middleFinger);
      drawFinger(wrist, ringFinger);
      drawFinger(wrist, pinkyFinger);

      // Draw hand joints dots
      for (int i = 0; i < 21; i++) {
        final pt = getPoint(baseIndex + i);
        if (pt != null) {
          canvas.drawCircle(pt, 3.0, paintHandDot);
        }
      }
    }

    drawHand(60); // Left Hand
    drawHand(81); // Right Hand
  }

  @override
  bool shouldRepaint(covariant LandmarksPainter oldDelegate) => true;
}
