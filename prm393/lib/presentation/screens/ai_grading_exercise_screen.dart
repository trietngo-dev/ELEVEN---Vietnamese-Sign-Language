import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/entities/lesson_entity.dart';
import 'ai_grading_score_screen.dart';

class AiGradingExerciseScreen extends StatefulWidget {
  final LessonEntity lesson;

  const AiGradingExerciseScreen({
    super.key,
    required this.lesson,
  });

  @override
  State<AiGradingExerciseScreen> createState() => _AiGradingExerciseScreenState();
}

class _AiGradingExerciseScreenState extends State<AiGradingExerciseScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scanAnimation;
  bool _isAnalyzing = false;
  Timer? _analysisTimer;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _scanAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    _analysisTimer?.cancel();
    super.dispose();
  }

  void _onSubmitExercise() {
    setState(() {
      _isAnalyzing = true;
    });

    // Simulate 2 seconds of analysis before navigating to results
    _analysisTimer = Timer(const Duration(seconds: 2), () async {
      if (!mounted) return;
      final result = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => AiGradingScoreScreen(lesson: widget.lesson),
        ),
      );

      if (!mounted) return;
      if (result != null) {
        Navigator.pop(context, result);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppTheme.onSurfaceVariant),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'VSL LEARNER',
          style: textTheme.headlineSmall?.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
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
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Simulated Camera View Box
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24.0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceColor,
                          border: Border.all(color: Colors.white.withOpacity(0.1)),
                        ),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            // Webcam image placeholder
                            Image.network(
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuD3w63ifAwv25Lwim5ap4c9Zx6lYPmw4Zlh5yanP_O_zrtot1MySo07Wjw2yx4kwHOloOpg7zBdfFOco00JiLRInt1o15AIyd6x-z72xh_Sk9ku6tt47jtrbS5SYgBFZDqv8Mnug5zlKDqzE_k5MjZYzpXS9A8Zjxvbtoklp_B86ECRbf_Di98DQsemG8siFadgwUkFE_fzGL3rRElzJwV6FHVvXsrJ-PdXZJs74r_2KMgK1RefHzpvKnht4l93gjnEmsRvLBven38',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Container(
                                color: Colors.black54,
                                child: const Center(
                                  child: Icon(Icons.videocam_off_rounded, size: 64, color: AppTheme.onSurfaceVariant),
                                ),
                              ),
                            ),
                            // Dark gradient overlay
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [Colors.black.withOpacity(0.4), Colors.transparent],
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                ),
                              ),
                            ),

                            // AI Face Overlay Tracker (dotted circle at top)
                            Align(
                              alignment: const Alignment(0, -0.65),
                              child: Container(
                                width: 110,
                                height: 110,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.25),
                                    style: BorderStyle.solid,
                                    width: 1.5,
                                  ),
                                ),
                                child: Stack(
                                  children: [
                                    Align(
                                      alignment: Alignment.topCenter,
                                      child: Container(width: 4, height: 4, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.primaryColor)),
                                    ),
                                    Align(
                                      alignment: Alignment.bottomCenter,
                                      child: Container(width: 4, height: 4, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.primaryColor)),
                                    ),
                                    Align(
                                      alignment: Alignment.centerLeft,
                                      child: Container(width: 4, height: 4, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.primaryColor)),
                                    ),
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: Container(width: 4, height: 4, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.primaryColor)),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            // AI Hand Tracking Viewport (centered rectangle)
                            Align(
                              alignment: const Alignment(0, 0.45),
                              child: Container(
                                width: size.width * 0.65,
                                height: 180,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppTheme.primaryColor.withOpacity(0.6), width: 2.0),
                                ),
                                child: Stack(
                                  children: [
                                    // Corner markers
                                    Positioned(top: -2, left: -2, child: Container(width: 12, height: 12, decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppTheme.primaryColor, width: 3), left: BorderSide(color: AppTheme.primaryColor, width: 3))))),
                                    Positioned(top: -2, right: -2, child: Container(width: 12, height: 12, decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppTheme.primaryColor, width: 3), right: BorderSide(color: AppTheme.primaryColor, width: 3))))),
                                    Positioned(bottom: -2, left: -2, child: Container(width: 12, height: 12, decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.primaryColor, width: 3), left: BorderSide(color: AppTheme.primaryColor, width: 3))))),
                                    Positioned(bottom: -2, right: -2, child: Container(width: 12, height: 12, decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.primaryColor, width: 3), right: BorderSide(color: AppTheme.primaryColor, width: 3))))),
                                    
                                    // Animated scanning line
                                    AnimatedBuilder(
                                      animation: _scanAnimation,
                                      builder: (context, child) {
                                        return Positioned(
                                          top: 180 * _scanAnimation.value,
                                          left: 0,
                                          right: 0,
                                          child: Container(
                                            height: 2,
                                            decoration: BoxDecoration(
                                              boxShadow: [
                                                BoxShadow(
                                                  color: AppTheme.primaryColor.withOpacity(0.8),
                                                  blurRadius: 6,
                                                  spreadRadius: 1,
                                                )
                                              ],
                                              gradient: const LinearGradient(
                                                colors: [Colors.transparent, AppTheme.primaryColor, Colors.transparent],
                                              ),
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            // Status Indicator Pill (Recording/Analyzing)
                            Positioned(
                              top: 16,
                              left: 16,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.55),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.white.withOpacity(0.15)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: _isAnalyzing ? AppTheme.primaryColor : const Color(0xFFE46C6C),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      _isAnalyzing ? 'Đang phân tích...' : 'Đang ghi hình...',
                                      style: textTheme.labelLarge?.copyWith(
                                        fontSize: 11,
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
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
                  ),
                  const SizedBox(height: 20),

                  // Bottom Action Buttons
                  ElevatedButton(
                    onPressed: _isAnalyzing ? null : _onSubmitExercise,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: AppTheme.onPrimaryContainer,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      elevation: 8,
                      shadowColor: AppTheme.primaryColor.withOpacity(0.3),
                    ),
                    child: _isAnalyzing
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              valueColor: AlwaysStoppedAnimation(AppTheme.onPrimaryContainer),
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Hoàn thành bài tập',
                                style: textTheme.labelLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: AppTheme.onPrimaryContainer,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward_rounded, size: 16),
                            ],
                          ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: _isAnalyzing ? null : () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(color: Colors.white.withOpacity(0.12)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                    child: const Text('Luyện tập lại / Hủy'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
