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
import '../../core/theme/app_theme.dart';
import '../../data/datasources/gesture_data_source.dart';

enum PracticeStep {
  ready,
  initializing,
  countdown,
  recording,
  analyzing,
  result,
}

class GestureTestScreen extends StatefulWidget {
  final LessonModel lesson;

  const GestureTestScreen({super.key, required this.lesson});

  @override
  State<GestureTestScreen> createState() => _GestureTestScreenState();
}

class _GestureTestScreenState extends State<GestureTestScreen>
    with WidgetsBindingObserver {
  PracticeStep _currentStep = PracticeStep.ready;
  CameraController? _cameraController;
  final SignLanguageProcessor _processor = SignLanguageProcessor();
  bool _isCameraInitialized = false;

  int _countdown = 3;
  Timer? _countdownTimer;

  final List<List<double>> _collectedFrames = [];
  int _lastFrameTime = 0;
  bool _isProcessingFrame = false;
  List<double>? _latestFeatures;

  String _status = 'Sẵn sàng kiểm tra cử chỉ';
  String? _recognizedWord;
  double _confidence = 0.0;
  bool _isMatch = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _countdownTimer?.cancel();
    _cleanupCameraSync();
    _processor.close();
    super.dispose();
  }

  void _cleanupCameraSync() {
    if (_cameraController != null) {
      try {
        if (_cameraController!.value.isStreamingImages) {
          _cameraController!.stopImageStream();
        }
      } catch (e) {
        debugPrint("Error stopping image stream sync: $e");
      }
      try {
        _cameraController!.dispose();
      } catch (e) {
        debugPrint("Error disposing camera sync: $e");
      }
      _cameraController = null;
    }
  }

  Future<void> _cleanupCamera() async {
    if (_cameraController != null) {
      try {
        if (_cameraController!.value.isStreamingImages) {
          await _cameraController!.stopImageStream();
        }
      } catch (e) {
        debugPrint("Error stopping image stream: $e");
      }
      try {
        await _cameraController!.dispose();
      } catch (e) {
        debugPrint("Error disposing camera: $e");
      }
      _cameraController = null;
    }
    if (mounted) {
      setState(() {
        _isCameraInitialized = false;
      });
    }
  }

  String _normalizeWord(String? str) {
    if (str == null) return "";
    
    // Simple Vietnamese tone/diacritics removal
    var text = str.toLowerCase();
    
    const vietnamese = [
      'aàảãáạăằẳẵắặâầẩẫấậ',
      'dđ',
      'eèẻẽéẹêềểễếệ',
      'iìỉĩíị',
      'oòỏõóọôồổỗốộơờởỡớợ',
      'uùủũúụưừửữứự',
      'yỳỷỹýỵ'
    ];
    
    const english = ['a', 'd', 'e', 'i', 'o', 'u', 'y'];
    
    for (int i = 0; i < vietnamese.length; i++) {
      for (var char in vietnamese[i].split('')) {
        text = text.replaceAll(char, english[i]);
      }
    }
    
    // Remove non-alphanumeric characters and spaces
    return text.replaceAll(RegExp(r'[^a-z0-9]'), '');
  }

  Future<void> _startPractice() async {
    setState(() {
      _currentStep = PracticeStep.initializing;
      _status = 'Đang thiết lập AI...';
      _latestFeatures = null;
      _collectedFrames.clear();
    });

    try {
      // 1. Initialize holistic processor
      await _processor.initialize();

      // 2. Initialize camera
      final cameras = await availableCameras();
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

      // 3. Start image stream
      _startImageStream();

      // 4. Trigger countdown
      _triggerCountdown();
    } catch (e) {
      if (mounted) {
        setState(() {
          _currentStep = PracticeStep.ready;
          _status = 'Lỗi khởi tạo: $e';
        });
      }
    }
  }

  void _triggerCountdown() {
    setState(() {
      _currentStep = PracticeStep.countdown;
      _countdown = 3;
      _status = 'Chuẩn bị bắt đầu...';
    });

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        if (_countdown > 1) {
          _countdown--;
        } else {
          timer.cancel();
          _countdownTimer = null;
          _startRecording();
        }
      });
    });
  }

  void _startRecording() {
    setState(() {
      _currentStep = PracticeStep.recording;
      _collectedFrames.clear();
      _latestFeatures = null;
      _status = 'Hãy thực hiện cử chỉ!';
    });
  }

  void _startImageStream() {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    _cameraController!.startImageStream((CameraImage image) async {
      if (!mounted || _currentStep != PracticeStep.recording) return;
      if (_isProcessingFrame) return;

      final now = DateTime.now().millisecondsSinceEpoch;
      if (now - _lastFrameTime < 70) {
        return; // Throttle to ~14 fps (matching web 70ms capture interval)
      }

      _isProcessingFrame = true;
      _lastFrameTime = now;

      try {
        final inputImage = _convertCameraImage(image);
        if (inputImage == null) {
          _isProcessingFrame = false;
          return;
        }

        final features = await _processor.processImage(inputImage);
        if (!mounted || _currentStep != PracticeStep.recording) {
          _isProcessingFrame = false;
          return;
        }

        if (features.isNotEmpty) {
          _collectedFrames.add(features);
          setState(() {
            _latestFeatures = _processor.latestCroppedFeatures;
            _status = 'Đang ghi hình: ${_collectedFrames.length}/50';
          });

          if (_collectedFrames.length >= 50) {
            _finishRecording();
          }
        }
      } catch (e) {
        debugPrint("Lỗi xử lý frame: $e");
      } finally {
        _isProcessingFrame = false;
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
          bytesPerRow: width,
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

  Future<void> _finishRecording() async {
    final gestureDs = RepositoryProvider.of<GestureDataSource>(context);
    setState(() {
      _currentStep = PracticeStep.analyzing;
      _status = 'Đang phân tích cử chỉ...';
    });

    // Immediately stop image stream and dispose camera to free up resources
    await _cleanupCamera();

    try {
      final flattenedFeatures = _collectedFrames.expand((frame) => frame).toList();

      final result = await gestureDs.predictGesture(flattenedFeatures);

      final word = (result['word'] ?? result['label'] ?? '') as String;
      final confidence = (result['confidence'] ?? 0.0) as double;

      final targetWord = _normalizeWord(widget.lesson.title);
      final predictedWord = _normalizeWord(word);

      final isMatch = word.isNotEmpty && predictedWord == targetWord && confidence >= 0.95;

      if (!mounted) return;

      setState(() {
        _recognizedWord = word;
        _confidence = confidence;
        _isMatch = isMatch;
        _currentStep = PracticeStep.result;
        _status = isMatch ? 'Chúc mừng! Bạn đã hoàn thành.' : 'Chưa khớp cử chỉ bài học';
      });

      if (isMatch) {
        await _completeLessonProgress();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _recognizedWord = 'Lỗi kết nối AI Server';
          _confidence = 0.0;
          _isMatch = false;
          _currentStep = PracticeStep.result;
          _status = 'Lỗi phân tích: $e';
        });
      }
    }
  }

  Future<void> _completeLessonProgress() async {
    final courseDs = context.read<CourseDataSource>();
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getInt('auth_user_id') ?? 1;

    final double score = _confidence > 0 ? _confidence * 100 : 95.0;

    final success = await courseDs.completeLesson(
      userId: userId,
      lessonId: widget.lesson.id,
      accuracy: score,
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
                "Bạn đã vượt qua bài kiểm tra cử chỉ \"${widget.lesson.title}\" xuất sắc và nhận được +${widget.lesson.xpEarned} XP điểm thưởng!",
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
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.inactive) {
      _cleanupCamera();
    } else if (state == AppLifecycleState.resumed && _currentStep == PracticeStep.recording) {
      _startPractice();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Kiểm Tra Với AI"),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.bgGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Highlight Target Word Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.12)),
                  ),
                  child: Column(
                    children: [
                      Text(
                        "CỬ CHỈ CẦN THỰC HIỆN",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                          color: theme.primaryColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.primarySubtle,
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: Text(
                          widget.lesson.title.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Center viewport depending on state
                Expanded(
                  child: Card(
                    clipBehavior: Clip.antiAlias,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    margin: EdgeInsets.zero,
                    color: Colors.black.withOpacity(0.2),
                    elevation: 4,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Viewport contents based on step
                        _buildStepViewport(theme),

                        // Guidelines guide outline (only when camera is active)
                        if ((_currentStep == PracticeStep.countdown ||
                                _currentStep == PracticeStep.recording) &&
                            _isCameraInitialized)
                          Positioned.fill(
                            child: CustomPaint(painter: HalfBodyGuidePainter()),
                          ),

                        // Live landmarks skeleton overlay
                        if (_currentStep == PracticeStep.recording &&
                            _latestFeatures != null)
                          Positioned.fill(
                            child: CustomPaint(
                              painter: LandmarksPainter(
                                features: _latestFeatures!,
                              ),
                            ),
                          ),

                        // Pulse recording banner overlay
                        if (_currentStep == PracticeStep.recording)
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
                                    "Ghi: ${_collectedFrames.length}/50",
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

                // Bottom Status
                Text(
                  "Trạng thái: $_status",
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepViewport(ThemeData theme) {
    switch (_currentStep) {
      case PracticeStep.ready:
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.black.withOpacity(0.4),
                Colors.black.withOpacity(0.6),
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.primaryColor.withOpacity(0.3), width: 2),
                ),
                child: const Icon(
                  Icons.camera_front_rounded,
                  size: 36,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                "Sẵn sàng kiểm tra cử chỉ?",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  "Hãy đặt điện thoại đứng thẳng, đứng lùi ra xa sao cho camera trước nhìn rõ đầu, hai vai và hai tay của bạn.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    height: 1.5,
                    color: Colors.white60,
                  ),
                ),
              ),
              const SizedBox(height: 36),
              ElevatedButton.icon(
                onPressed: _startPractice,
                icon: const Icon(Icons.videocam_rounded),
                label: const Text("BẮT ĐẦU NGAY"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  elevation: 5,
                ),
              ),
            ],
          ),
        );

      case PracticeStep.initializing:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(
                width: 48,
                height: 48,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                "Đang thiết lập AI & Camera...",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withOpacity(0.8),
                ),
              ),
            ],
          ),
        );

      case PracticeStep.countdown:
        return Stack(
          fit: StackFit.expand,
          children: [
            _isCameraInitialized
                ? CameraPreview(_cameraController!)
                : const SizedBox.shrink(),
            Container(
              color: Colors.black.withOpacity(0.6),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "$_countdown",
                      style: const TextStyle(
                        fontSize: 96,
                        fontWeight: FontWeight.w900,
                        color: Colors.amberAccent,
                        shadows: [
                          Shadow(
                            color: Colors.black45,
                            blurRadius: 10,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      "CHUẨN BỊ THỰC HIỆN CỬ CHỈ...",
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );

      case PracticeStep.recording:
        return Stack(
          fit: StackFit.expand,
          children: [
            _isCameraInitialized
                ? CameraPreview(_cameraController!)
                : const SizedBox.shrink(),
            // Progress bar at the bottom of the camera viewport
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                height: 6,
                color: Colors.black26,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: FractionallySizedBox(
                    widthFactor: _collectedFrames.length / 50,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.redAccent, AppTheme.primaryColor],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );

      case PracticeStep.analyzing:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(
                width: 48,
                height: 48,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                "AI đang phân tích cử chỉ của bạn...",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Đang đối chiếu dữ liệu với từ điển hệ thống",
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.white.withOpacity(0.5),
                ),
              ),
            ],
          ),
        );

      case PracticeStep.result:
        final roundedConfidence = (_confidence * 100).round();
        return Container(
          padding: const EdgeInsets.all(24),
          color: Colors.black.withOpacity(0.4),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _isMatch ? Icons.check_circle_outline_rounded : Icons.highlight_off_rounded,
                size: 80,
                color: _isMatch ? Colors.greenAccent : Colors.redAccent,
              ),
              const SizedBox(height: 20),
              Text(
                _isMatch ? "CHÍNH XÁC!" : "CHƯA CHÍNH XÁC",
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: _isMatch ? Colors.greenAccent : Colors.redAccent,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 12),
              if (!_isMatch) ...[
                Text(
                  "Nhận diện được: \"$_recognizedWord\"",
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "Độ khớp: $roundedConfidence%",
                  style: const TextStyle(
                    fontSize: 13,
                    color: Colors.white70,
                  ),
                ),
              ] else ...[
                Text(
                  "Độ khớp cử chỉ đạt: $roundedConfidence%",
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ],
              const SizedBox(height: 36),
              _isMatch
                  ? ElevatedButton.icon(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.arrow_back),
                      label: const Text("HOÀN THÀNH"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                    )
                  : ElevatedButton.icon(
                      onPressed: _startPractice,
                      icon: const Icon(Icons.refresh),
                      label: const Text("THỬ LẠI"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                    ),
            ],
          ),
        );
    }
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
