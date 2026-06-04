import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:video_player/video_player.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

  // Active Progress & Challenge States
  bool _isVideoWatched = false;
  bool _isAiCompleted = false;
  int _dailyChallengeCount = 2; // Default starting value
  bool _isBookmarked = false;

  @override
  void initState() {
    super.initState();
    _loadLocalProgress();
    if (widget.lesson.videoMediaId != null) {
      _loadAndInitVideo();
    }
  }

  Future<void> _loadLocalProgress() async {
    final ds = context.read<CourseDataSource>();
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getInt('auth_user_id') ?? 1;

    bool bookmarkedOnBackend = false;
    try {
      final savedIds = await ds.getBookmarkedLessonIds(userId);
      bookmarkedOnBackend = savedIds.contains(widget.lesson.id);
    } catch (_) {}

    if (mounted) {
      setState(() {
        _isVideoWatched = prefs.getBool('video_watched_${widget.lesson.id}') ?? false;
        _isAiCompleted = prefs.getBool('ai_completed_${widget.lesson.id}') ?? false;
        _dailyChallengeCount = prefs.getInt('daily_challenge_count') ?? 2;
        _isBookmarked = bookmarkedOnBackend;
      });
    }
  }

  Future<void> _toggleBookmark() async {
    final ds = context.read<CourseDataSource>();
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getInt('auth_user_id') ?? 1;

    setState(() {
      _isBookmarked = !_isBookmarked;
    });

    try {
      final success = await ds.toggleBookmark(
        userId,
        widget.lesson.id,
        widget.lesson.title,
        widget.lesson.content,
      );

      if (!success) {
        if (mounted) {
          setState(() {
            _isBookmarked = !_isBookmarked;
          });
        }
        throw Exception('Không thể cập nhật trên máy chủ.');
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isBookmarked ? 'Đã thêm bài học vào danh mục Lưu từ!' : 'Đã xóa bài học khỏi danh mục Lưu từ!'),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $e'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
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
        _controller!.addListener(_videoListener);
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

  void _videoListener() {
    if (_controller == null || !_isVideoInitialized) return;
    final position = _controller!.value.position;
    final duration = _controller!.value.duration;
    // Mark as watched when 90% of the video is completed
    if (position >= duration - const Duration(milliseconds: 800) || 
        (duration.inMilliseconds > 0 && position.inMilliseconds / duration.inMilliseconds >= 0.9)) {
      _markVideoAsWatched();
    }
  }

  Future<void> _markVideoAsWatched() async {
    if (_isVideoWatched) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('video_watched_${widget.lesson.id}', true);
    if (mounted) {
      setState(() {
        _isVideoWatched = true;
      });
    }
  }

  @override
  void dispose() {
    _controller?.removeListener(_videoListener);
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

    // Compute progress percentage
    double totalProgress = 0.0;
    if (_isVideoWatched) totalProgress += 0.5;
    if (_isAiCompleted) totalProgress += 0.5;
    final int progressPercent = (totalProgress * 100).toInt();

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
            const SizedBox(height: 16),

            // 2. Lesson Title Header and Metadata
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.lesson.title,
                        style: GoogleFonts.quicksand(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            "Cấp độ: Beginner",
                            style: GoogleFonts.quicksand(
                              fontSize: 12,
                              color: textMutedColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 10),
                          _buildRewardChip(widget.lesson.xpEarned),
                        ],
                      ),
                    ],
                  ),
                ),
                Row(
                  children: [
                    // Action: Tương tác AI
                    IconButton(
                      icon: const Icon(Icons.psychology_rounded, color: mintColor, size: 24),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => GestureTestScreen(lesson: widget.lesson),
                          ),
                        ).then((_) => _loadLocalProgress());
                      },
                      tooltip: 'Tương tác AI',
                    ),
                    // Action: Lưu từ
                    IconButton(
                      icon: Icon(
                        _isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                        color: _isBookmarked ? Colors.amber : textMutedColor,
                        size: 24,
                      ),
                      onPressed: _toggleBookmark,
                      tooltip: 'Lưu từ',
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),

            // 3. Tiến Trình Học Tập (Circular tracker & Checklist steps - matching Web design)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: darkCardColor,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
              ),
              child: Row(
                children: [
                  // Circular Progress Chart
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 76,
                        height: 76,
                        child: CircularProgressIndicator(
                          value: totalProgress,
                          strokeWidth: 7,
                          backgroundColor: Colors.white.withValues(alpha: 0.04),
                          valueColor: const AlwaysStoppedAnimation<Color>(mintColor),
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            "$progressPercent%",
                            style: GoogleFonts.quicksand(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Text(
                            "TIẾN TRÌNH",
                            style: TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(width: 24),
                  
                  // Steps Checklist
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFigmaStepRow("1. Xem video giảng dạy", _isVideoWatched ? "Đã xem" : "Chưa xem", _isVideoWatched, mintColor, textMutedColor),
                        const SizedBox(height: 10),
                        _buildFigmaStepRow("2. Kiểm tra với AI", _isAiCompleted ? "Đạt 95%" : "Chưa đạt", _isAiCompleted, mintColor, textMutedColor),
                        const SizedBox(height: 10),
                        _buildFigmaStepRow("3. Hoàn thành bài học", (_isVideoWatched && _isAiCompleted) ? "Hoàn thành" : "Chưa xong", _isVideoWatched && _isAiCompleted, mintColor, textMutedColor),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 4. Thử thách hàng ngày (Daily Challenge Progress Bar - matching Web)
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
                  const Text(
                    "Thử thách hàng ngày",
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "Hoàn thành 5 từ vựng giao tiếp để nhận huy hiệu mới!",
                    style: TextStyle(color: textMutedColor, fontSize: 11),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: _dailyChallengeCount / 5.0,
                            minHeight: 8,
                            backgroundColor: Colors.white.withValues(alpha: 0.04),
                            valueColor: const AlwaysStoppedAnimation<Color>(mintColor),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Text(
                        "$_dailyChallengeCount/5 bài (${(_dailyChallengeCount * 20)}%)",
                        style: const TextStyle(color: mintColor, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 5. Ý nghĩa & Sử dụng Card (Meaning & Usage)
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
                    children: [
                      const Icon(Icons.info_outline_rounded, color: mintColor, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        "Ý nghĩa & Sử dụng",
                        style: GoogleFonts.quicksand(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "Học từ khóa: \"${widget.lesson.title}\". Từ ngữ được sử dụng rộng rãi trong giao tiếp hàng ngày để diễn tả trạng thái thân thiện, làm quen và khởi đầu cuộc trò chuyện lịch sự.",
                    style: const TextStyle(color: textMutedColor, fontSize: 13, height: 1.45),
                  ),
                  const SizedBox(height: 12),
                  // Styled Blockquote matching Figma web
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F1512),
                      borderRadius: BorderRadius.circular(12),
                      border: const Border(
                        left: BorderSide(color: mintColor, width: 4),
                      ),
                    ),
                    child: Text(
                      "\"Nắm vững cử chỉ tay, vị trí đặt tay kết hợp với biểu cảm khuôn mặt tự nhiên để diễn tả trọn vẹn ý nghĩa của từ khóa.\"",
                      style: GoogleFonts.quicksand(
                        color: Colors.white,
                        fontSize: 12.5,
                        fontStyle: FontStyle.italic,
                        fontWeight: FontWeight.w500,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 6. Thông tin bổ sung Card (Additional Info)
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
                    children: [
                      const Icon(Icons.assignment_rounded, color: mintColor, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        "Thông tin bổ sung",
                        style: GoogleFonts.quicksand(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildFigmaInfoRow("1", "Thời gian học ước tính: 1 phút"),
                  const SizedBox(height: 10),
                  _buildFigmaInfoRow("2", "Thứ tự bài học trong học phần: ${widget.lesson.orderIndex + 1}"),
                  const SizedBox(height: 10),
                  _buildFigmaInfoRow("3", "Hãy thực hành đều đặn bằng camera AI để nhận điểm thưởng XP."),
                ],
              ),
            ),
            const SizedBox(height: 30),

            // 7. Bắt Đầu Kiểm Tra AI Action Button
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => GestureTestScreen(lesson: widget.lesson),
                  ),
                ).then((_) => _loadLocalProgress());
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
            const SizedBox(height: 16),
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
          
          // Video controls overlay
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

  Widget _buildRewardChip(int xp) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1F1C),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.25), width: 1.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt_rounded, color: Colors.amber, size: 12),
          const SizedBox(width: 2),
          Text(
            "+$xp XP",
            style: const TextStyle(
              color: Colors.amber,
              fontWeight: FontWeight.bold,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFigmaStepRow(String title, String status, bool isChecked, Color mint, Color muted) {
    return Row(
      children: [
        Icon(
          isChecked ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
          color: isChecked ? mint : muted,
          size: 16,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              color: isChecked ? Colors.white : const Color(0xFF64748B),
              fontSize: 12,
              fontWeight: isChecked ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: isChecked ? mint.withValues(alpha: 0.15) : Colors.white.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: isChecked ? mint.withValues(alpha: 0.2) : Colors.transparent),
          ),
          child: Text(
            status,
            style: TextStyle(
              color: isChecked ? mint : muted,
              fontSize: 9,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFigmaInfoRow(String index, String content) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 18,
          height: 18,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: Color(0xFF0F1512),
            shape: BoxShape.circle,
          ),
          child: Text(
            index,
            style: const TextStyle(
              color: Color(0xFF10B981),
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            content,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }
}
