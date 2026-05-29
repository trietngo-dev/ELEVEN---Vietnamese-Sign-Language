import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:video_player/video_player.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../data/models/lesson_model.dart';
import '../../data/datasources/course_data_source.dart';
import 'gesture_test_screen.dart';

class LessonDetailScreen extends StatefulWidget {
  final LessonModel lesson;

  const LessonDetailScreen({super.key, required this.lesson});

  @override
  State<LessonDetailScreen> createState() => _LessonDetailScreenState();
}

class _LessonDetailScreenState extends State<LessonDetailScreen> {
  VideoPlayerController? _controller;
  bool _isVideoLoading = false;
  bool _isVideoInitialized = false;
  bool _hasVideoError = false;
  bool _showControls = true;

  @override
  void initState() {
    super.initState();
    if (widget.lesson.videoMediaId != null) {
      _loadAndInitVideo();
    }
  }

  Future<void> _loadAndInitVideo() async {
    setState(() {
      _isVideoLoading = true;
      _hasVideoError = false;
    });

    try {
      final ds = context.read<CourseDataSource>();
      final url = await ds.getVideoUrl(widget.lesson.videoMediaId!);
      if (url != null && url.isNotEmpty) {
        _controller = VideoPlayerController.networkUrl(Uri.parse(url));
        await _controller!.initialize();
        if (mounted) {
          setState(() {
            _isVideoInitialized = true;
            _isVideoLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _isVideoLoading = false;
            _hasVideoError = true;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isVideoLoading = false;
          _hasVideoError = true;
        });
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _togglePlayPause() {
    if (_controller == null || !_isVideoInitialized) return;
    setState(() {
      if (_controller!.value.isPlaying) {
        _controller!.pause();
      } else {
        _controller!.play();
      }
    });
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$minutes:$seconds";
  }

  @override
  Widget build(BuildContext context) {
    const Color darkBgColor = Color(0xFF0A0F0D);
    const Color darkCardColor = Color(0xFF131A16);
    const Color mintColor = Color(0xFF10B981);
    const Color textMutedColor = Color(0xFF94A3B8);

    return Scaffold(
      backgroundColor: darkBgColor,
      appBar: AppBar(
        backgroundColor: darkBgColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          widget.lesson.title,
          style: GoogleFonts.quicksand(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Video Player Container
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Container(
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(
                  color: darkCardColor,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                ),
                child: _buildVideoView(mintColor, textMutedColor),
              ),
            ),
            const SizedBox(height: 24),

            // 2. Lesson Description Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: darkCardColor,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Lý thuyết bài giảng",
                        style: GoogleFonts.quicksand(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      _buildRewardChip(widget.lesson.xpEarned, mintColor),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.lesson.content ?? 
                        "Bài giảng tập trung hướng dẫn chi tiết các ký hiệu, biểu cảm và chuyển động ngón tay chuẩn cho từ khóa trong bài học. Hãy chú ý theo dõi video hướng dẫn kỹ lưỡng trước khi bắt đầu bài kiểm tra nhận diện cử chỉ thô bằng AI.",
                    style: const TextStyle(
                      color: textMutedColor,
                      height: 1.55,
                      fontSize: 13.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 36),

            // 3. AI Camera Test Action Button
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => GestureTestScreen(lesson: widget.lesson),
                  ),
                );
              },
              icon: const Icon(Icons.camera_front_rounded, size: 20),
              label: Text(
                "Bắt Đầu Kiểm Tra AI",
                style: GoogleFonts.quicksand(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: mintColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 4,
                shadowColor: mintColor.withValues(alpha: 0.3),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoView(Color mint, Color muted) {
    if (widget.lesson.videoMediaId == null) {
      return _buildPlaceholderView(Icons.cloud_off_rounded, "Bài học này chưa đính kèm video giảng dạy.", mint);
    }

    if (_isVideoLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: mint),
            const SizedBox(height: 12),
            Text(
              "Đang tải bài giảng...",
              style: TextStyle(color: muted, fontSize: 11),
            )
          ],
        ),
      );
    }

    if (_hasVideoError) {
      return _buildPlaceholderView(
        Icons.error_outline_rounded,
        "Không thể tải video từ máy chủ.\nVui lòng kiểm tra lại kết nối.",
        mint,
      );
    }

    if (!_isVideoInitialized || _controller == null) {
      return Center(child: CircularProgressIndicator(color: mint));
    }

    return GestureDetector(
      onTap: () {
        setState(() {
          _showControls = !_showControls;
        });
      },
      child: Stack(
        fit: StackFit.expand,
        children: [
          VideoPlayer(_controller!),
          
          // Custom Video controls overlay
          AnimatedOpacity(
            opacity: _showControls ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 300),
            child: Container(
              color: Colors.black.withValues(alpha: 0.5),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Title overlay bar
                  Container(
                    padding: const EdgeInsets.all(12),
                    alignment: Alignment.topLeft,
                    child: Text(
                      widget.lesson.title,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),

                  // Big Center play/pause
                  Center(
                    child: IconButton(
                      iconSize: 48,
                      icon: Icon(
                        _controller!.value.isPlaying
                            ? Icons.pause_circle_filled_rounded
                            : Icons.play_circle_filled_rounded,
                        color: Colors.white,
                      ),
                      onPressed: _togglePlayPause,
                    ),
                  ),

                  // Bottom seek bar and timers
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Video progress bar
                      VideoProgressIndicator(
                        _controller!,
                        allowScrubbing: true,
                        colors: VideoProgressColors(
                          playedColor: mint,
                          bufferedColor: Colors.white24,
                          backgroundColor: Colors.white10,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _formatDuration(_controller!.value.position),
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              _formatDuration(_controller!.value.duration),
                              style: const TextStyle(color: Colors.white70, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderView(IconData icon, String text, Color mint) {
    return Stack(
      fit: StackFit.expand,
      alignment: Alignment.center,
      children: [
        // Premium subtle radial gradient background
        Container(
          decoration: const BoxDecoration(
            gradient: RadialGradient(
              colors: [Color(0xFF1E2E25), Color(0xFF0F1512)],
              center: Alignment.center,
              radius: 1.0,
            ),
          ),
        ),
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: mint.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 40, color: mint),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                text,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 12,
                  height: 1.4,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRewardChip(int xp, Color mint) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1F1C),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.25), width: 1.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt_rounded, color: Colors.amber, size: 14),
          const SizedBox(width: 4),
          Text(
            "+$xp XP",
            style: const TextStyle(
              color: Colors.amber,
              fontWeight: FontWeight.bold,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}
