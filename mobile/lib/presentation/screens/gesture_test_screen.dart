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



class _GestureTestScreenState extends State<GestureTestScreen> with WidgetsBindingObserver {
  CameraController? _cameraController;
  final SignLanguageProcessor _processor = SignLanguageProcessor();
  bool _isCameraInitialized = false;
  bool _isCollecting = false;
  int _capturedFrames = 0;
  List<String> _words = [];
  String _finalSentence = 'Câu hoàn chỉnh sẽ hiển thị tại đây!';
  String _status = 'Sẵn sàng kiểm tra cử chỉ';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeCamera();
    context.read<GestureBloc>().add(GestureSessionReset());
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
        imageFormatGroup: ImageFormatGroup.yuv420,
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
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;

    _cameraController!.startImageStream((CameraImage image) async {
      if (!_isCollecting) return;

      // Convert CameraImage to ML Kit InputImage
      final inputImage = _convertCameraImage(image);
      if (inputImage == null) return;

      final features = await _processor.processImage(inputImage);
      if (features.isNotEmpty && mounted) {
        context.read<GestureBloc>().add(GestureFrameCaptured(features));
      }
    });
  }

  InputImage? _convertCameraImage(CameraImage image) {
    try {
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      final Size imageSize = Size(image.width.toDouble(), image.height.toDouble());
      
      // Fix description for rotation mapping based on front camera
      final imageRotation = InputImageRotation.rotation270deg;
      final imageFormat = InputImageFormat.yuv420;

      final inputImageMetadata = InputImageMetadata(
        size: imageSize,
        rotation: imageRotation,
        format: imageFormat,
        bytesPerRow: image.planes[0].bytesPerRow,
      );

      return InputImage.fromBytes(bytes: bytes, metadata: inputImageMetadata);
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
        _status = 'Đang hoàn tất và trau chuốt bằng Gemini...';
      });
      gestureBloc.add(GesturePolishRequested());
    } else {
      setState(() {
        _isCollecting = true;
        _capturedFrames = 0;
        _words.clear();
        _finalSentence = '';
        _status = 'Đang lắng nghe cử chỉ của bạn...';
      });
      gestureBloc.add(GestureSessionReset());
    }
  }

  Future<void> _completeLessonProgress() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getInt('auth_user_id') ?? 1;

    final success = await context.read<CourseDataSource>().completeLesson(
      userId: userId,
      lessonId: widget.lesson.id,
      accuracy: 95.0, // AI Score matching LSTM accuracy fallback
      xpEarned: widget.lesson.xpEarned,
    );

    if (success && mounted) {
      // Save local xp
      final currentXp = prefs.getInt('auth_user_xp') ?? 100;
      await prefs.setInt('auth_user_xp', currentXp + widget.lesson.xpEarned);

      _showCompletionDialog();
    }
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text(
            "Chúc Mừng!",
            style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
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
      appBar: AppBar(
        title: const Text("Kiểm Tra AI"),
      ),
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
                    aspectRatio: 1, // mirrored square frame matching web
                    child: Card(
                      clipBehavior: Clip.antiAlias,
                      margin: EdgeInsets.zero,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          _isCameraInitialized
                              ? Transform(
                                  alignment: Alignment.center,
                                  transform: Matrix4.rotationY(3.14159), // Mirror camera preview
                                  child: CameraPreview(_cameraController!),
                                )
                              : const Center(
                                  child: CircularProgressIndicator(),
                                ),
                          
                          // Circular guides
                          Positioned.fill(
                            child: Container(
                              margin: const EdgeInsets.all(32),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.white24, style: BorderStyle.solid, width: 2),
                                borderRadius: BorderRadius.circular(24),
                              ),
                            ),
                          ),
                          
                          // Countdown timer overlay
                          if (_isCollecting)
                            Positioned(
                              top: 16,
                              right: 16,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.redAccent,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.radio_button_checked_rounded, color: Colors.white, size: 14),
                                    const SizedBox(width: 6),
                                    Text(
                                      "Ghi: $_capturedFrames/50",
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
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
                      backgroundColor: _isCollecting ? Colors.amber[700] : theme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(
                      _isCollecting ? "Kết Thúc & Trau Chuốt" : "Bắt Đầu Dịch Cử Chỉ",
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
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
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryColor),
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _words.isEmpty
                                ? [
                                    Text(
                                      _isCollecting ? "Đang lắng nghe..." : "Chưa có từ nào",
                                      style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.grey, fontSize: 13),
                                    )
                                  ]
                                : _words.map((w) => Chip(
                                      label: Text(w, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor, fontSize: 12)),
                                      backgroundColor: AppTheme.primarySubtle,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      side: BorderSide.none,
                                    )).toList(),
                          ),
                          const Divider(height: 32, color: Color(0xFFEDF6E4)),
                          const Text(
                            "Câu dịch hoàn chỉnh",
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryColor),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _finalSentence,
                            style: theme.textTheme.headlineLarge?.copyWith(fontSize: 22, color: const Color(0xFF202734)),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            "Trạng thái: $_status",
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
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
