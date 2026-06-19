import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:video_player/video_player.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/usecases/learning/fetch_video_url_usecase.dart';
import '../../domain/entities/lesson_entity.dart';
import '../../domain/entities/user_lesson_progress_entity.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_state.dart';
import '../bloc/learning/learning_cubit.dart';
import 'ai_grading_exercise_screen.dart';

class LessonScreen extends StatefulWidget {
  final LessonEntity lesson;

  const LessonScreen({
    super.key,
    required this.lesson,
  });

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> {
  VideoPlayerController? _controller;
  bool _isVideoLoading = false;
  bool _isVideoInitialized = false;
  bool _hasVideoError = false;
  bool _showControls = true;
  int _userId = 3;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = context.read<AuthBloc>().state;
      if (authState is AuthAuthenticated) {
        _userId = authState.user.id;
      }
      // Trigger start lesson progress update
      context.read<LearningCubit>().startLesson(_userId, widget.lesson.id);
    });

    if (widget.lesson.videoMediaId != null) {
      _loadAndInitVideo();
    }
  }

  Future<void> _loadAndInitVideo() async {
    if (!mounted) return;
    setState(() {
      _isVideoLoading = true;
      _hasVideoError = false;
    });

    try {
      final useCase = context.read<FetchVideoUrlUseCase>();
      final url = await useCase(widget.lesson.videoMediaId!);
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

  Widget _buildVideoPlayer() {
    if (widget.lesson.videoMediaId == null) {
      return Container(
        color: Colors.black54,
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.video_camera_front_rounded, size: 48, color: AppTheme.primaryColor),
              SizedBox(height: 8),
              Text('Không có video cho bài học này', style: TextStyle(color: Colors.white70)),
            ],
          ),
        ),
      );
    }

    if (_isVideoLoading) {
      return Container(
        color: Colors.black54,
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(AppTheme.primaryColor)),
              SizedBox(height: 12),
              Text('Đang tải video...', style: TextStyle(color: Colors.white70, fontSize: 13)),
            ],
          ),
        ),
      );
    }

    if (_hasVideoError) {
      return Container(
        color: Colors.black54,
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline_rounded, size: 48, color: Colors.redAccent),
              SizedBox(height: 8),
              Text('Lỗi tải video từ server', style: TextStyle(color: Colors.white70)),
            ],
          ),
        ),
      );
    }

    if (!_isVideoInitialized || _controller == null) {
      return Container(
        color: Colors.black54,
        child: const Center(
          child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(AppTheme.primaryColor)),
        ),
      );
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
          
          // Controls overlay
          AnimatedOpacity(
            opacity: _showControls ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 300),
            child: Container(
              color: Colors.black.withOpacity(0.4),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Top Title Bar
                  Container(
                    padding: const EdgeInsets.all(12),
                    alignment: Alignment.topLeft,
                    child: Text(
                      widget.lesson.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),

                  // Center Play/Pause button
                  Center(
                    child: InkWell(
                      onTap: _togglePlayPause,
                      borderRadius: BorderRadius.circular(50),
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.black.withOpacity(0.4),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: Icon(
                          _controller!.value.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 38,
                        ),
                      ),
                    ),
                  ),

                  // Bottom Controls
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      VideoProgressIndicator(
                        _controller!,
                        allowScrubbing: true,
                        colors: const VideoProgressColors(
                          playedColor: AppTheme.primaryColor,
                          bufferedColor: Colors.white24,
                          backgroundColor: Colors.white10,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            ValueListenableBuilder(
                              valueListenable: _controller!,
                              builder: (context, VideoPlayerValue value, child) {
                                return Text(
                                  _formatDuration(value.position),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                );
                              },
                            ),
                            Text(
                              _formatDuration(_controller!.value.duration),
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 11,
                              ),
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

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.primaryColor),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Chi tiết bài học',
          style: textTheme.headlineSmall?.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.onSurfaceVariant),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.surfaceContainerHighest,
              child: const Icon(Icons.person_rounded, color: Colors.white, size: 16),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: Colors.white.withOpacity(0.05),
            height: 1.0,
          ),
        ),
      ),
      body: Stack(
        children: [
          Container(color: AppTheme.backgroundColor),
          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Video Player Card
                    AppTheme.glassPanel(
                      borderRadius: 16.0,
                      padding: EdgeInsets.zero,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: AspectRatio(
                          aspectRatio: 16 / 9,
                          child: _buildVideoPlayer(),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Tags row
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white.withOpacity(0.1)),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            widget.lesson.slug.toUpperCase().replaceAll('-', ' '),
                            style: textTheme.labelLarge?.copyWith(
                              fontSize: 9,
                              color: AppTheme.onSurfaceVariant,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
                          ),
                          child: Text(
                            widget.lesson.difficultyLevel,
                            style: textTheme.labelLarge?.copyWith(
                              fontSize: 9,
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Lesson Info Title & Description
                    Text(
                      widget.lesson.title,
                      style: textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        fontSize: 24,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      widget.lesson.shortDescription ?? widget.lesson.objectiveText ?? 'Bài học ngôn ngữ ký hiệu thông dụng.',
                      style: textTheme.bodyMedium?.copyWith(
                        color: AppTheme.onSurfaceVariant,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Duration and Reward info
                    Row(
                      children: [
                        const Icon(Icons.schedule_rounded, color: AppTheme.primaryColor, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          '${widget.lesson.estimatedMinutes} phút',
                          style: textTheme.bodyMedium?.copyWith(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(width: 24),
                        const Icon(Icons.stars_rounded, color: AppTheme.primaryColor, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          '+${widget.lesson.xpReward} XP',
                          style: textTheme.bodyMedium?.copyWith(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Bento sidebar / Action Cards
                    AppTheme.glassPanel(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          ElevatedButton(
                            onPressed: () async {
                              final result = await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => AiGradingExerciseScreen(lesson: widget.lesson),
                                ),
                              );

                              if (!context.mounted || result == null) return;

                              if (result is LessonEntity) {
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => LessonScreen(lesson: result),
                                  ),
                                );
                              } else if (result == 'completed_course') {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Chúc mừng bạn đã hoàn thành khóa học!'),
                                    backgroundColor: Color(0xFF10B981),
                                  ),
                                );
                                Navigator.pop(context);
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryContainer,
                              foregroundColor: AppTheme.onPrimaryContainer,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.assignment_turned_in_rounded, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Kiểm tra cử chỉ',
                                  style: textTheme.labelLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    color: AppTheme.onPrimaryContainer,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          ListTile(
                            tileColor: Colors.white.withOpacity(0.04),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            title: const Text(
                              'Bài học tiếp theo',
                              style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            trailing: const Icon(Icons.chevron_right_rounded, color: Colors.white, size: 20),
                            onTap: () {
                              final state = context.read<LearningCubit>().state;
                              final currentIndex = state.currentCourseLessons.indexWhere((l) => l.id == widget.lesson.id);
                              
                              if (currentIndex != -1 && currentIndex < state.currentCourseLessons.length - 1) {
                                final nextLesson = state.currentCourseLessons[currentIndex + 1];
                                
                                // Check if next lesson is locked
                                final prog = state.currentCourseProgress.firstWhere(
                                  (p) => p.lessonId == widget.lesson.id,
                                  orElse: () => UserLessonProgressEntity(
                                    id: 0,
                                    userId: _userId,
                                    lessonId: widget.lesson.id,
                                    status: 0,
                                    lastPositionSeconds: 0,
                                    attemptsCount: 0,
                                    bestAccuracy: 0.0,
                                    bestScore: 0.0,
                                    totalTimeSeconds: 0,
                                    xpEarned: 0,
                                  ),
                                );
                                
                                if (prog.status != 2) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Bài học tiếp theo đã bị khóa. Hãy hoàn thành bài học hiện tại trước!'),
                                      backgroundColor: AppTheme.surfaceContainer,
                                    ),
                                  );
                                } else {
                                  Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => LessonScreen(lesson: nextLesson),
                                    ),
                                  );
                                }
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Bạn đã ở bài học cuối cùng của khóa học này!'),
                                    backgroundColor: AppTheme.surfaceContainer,
                                  ),
                                );
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
