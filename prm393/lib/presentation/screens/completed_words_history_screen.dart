import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/usecases/learning/fetch_completed_lessons_with_progress_usecase.dart';
import '../../data/models/lesson_model.dart';
import '../../data/models/user_lesson_progress_model.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_state.dart';

class CompletedWordsHistoryScreen extends StatefulWidget {
  const CompletedWordsHistoryScreen({super.key});

  @override
  State<CompletedWordsHistoryScreen> createState() => _CompletedWordsHistoryScreenState();
}

class _CompletedWordsHistoryScreenState extends State<CompletedWordsHistoryScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _completedItems = [];

  @override
  void initState() {
    super.initState();
    _loadHistoryData();
  }

  Future<void> _loadHistoryData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authState = context.read<AuthBloc>().state;
      if (authState is AuthAuthenticated) {
        final userId = authState.user.id;
        final useCase = context.read<FetchCompletedLessonsWithProgressUseCase>();
        final items = await useCase(userId);
        
        if (mounted) {
          setState(() {
            _completedItems = items;
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatDateTime(String? isoString) {
    if (isoString == null || isoString.isEmpty) return '---';
    try {
      final dateTime = DateTime.parse(isoString).toLocal();
      final day = dateTime.day.toString().padLeft(2, '0');
      final month = dateTime.month.toString().padLeft(2, '0');
      final year = dateTime.year;
      final hour = dateTime.hour.toString().padLeft(2, '0');
      final minute = dateTime.minute.toString().padLeft(2, '0');
      return '$day/$month/$year $hour:$minute';
    } catch (_) {
      return isoString;
    }
  }

  String _formatDuration(int seconds) {
    if (seconds <= 0) return '0 giây';
    if (seconds < 60) return '$seconds giây';
    final minutes = seconds ~/ 60;
    final remainingSec = seconds % 60;
    if (remainingSec == 0) return '$minutes phút';
    return '$minutes phút $remainingSec giây';
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
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppTheme.onSurfaceVariant),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: Text(
          'TỪ VỰNG ĐÃ HỌC',
          style: textTheme.headlineSmall?.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            fontSize: 18,
            letterSpacing: 0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.onSurfaceVariant),
            onPressed: _loadHistoryData,
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
          // Background Color
          Container(color: AppTheme.backgroundColor),
          
          SafeArea(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                    ),
                  )
                : _completedItems.isEmpty
                    ? _buildEmptyState(textTheme)
                    : _buildHistoryList(textTheme),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(TextTheme textTheme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
      child: Center(
        child: AppTheme.glassPanel(
          padding: const EdgeInsets.all(32.0),
          borderRadius: 24.0,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.history_edu_rounded,
                  color: AppTheme.primaryColor,
                  size: 40,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Chưa có từ vựng nào!',
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Hãy bắt đầu học các cử chỉ ngôn ngữ ký hiệu mới trong kho bài học để lưu lại lịch sử học tập của bạn nhé.',
                style: textTheme.bodyMedium?.copyWith(
                  color: AppTheme.onSurfaceVariant,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: AppTheme.onPrimaryContainer,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                ),
                child: const Text(
                  'Bắt đầu học ngay',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHistoryList(TextTheme textTheme) {
    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16.0),
      itemCount: _completedItems.length,
      itemBuilder: (context, index) {
        final item = _completedItems[index];
        final lesson = item['lesson'] as LessonModel;
        final prog = item['progress'] as UserLessonProgressModel;

        final scorePercent = (prog.bestAccuracy * 100).toInt();

        return Container(
          margin: const EdgeInsets.only(bottom: 12.0),
          child: AppTheme.glassPanel(
            padding: const EdgeInsets.all(16.0),
            borderRadius: 16.0,
            child: ExpansionTile(
              tilePadding: EdgeInsets.zero,
              childrenPadding: const EdgeInsets.only(top: 12.0),
              iconColor: AppTheme.primaryColor,
              collapsedIconColor: AppTheme.onSurfaceVariant,
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_circle_rounded,
                      color: AppTheme.primaryColor,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lesson.title,
                          style: textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Độ chính xác: $scorePercent%',
                          style: textTheme.bodyMedium?.copyWith(
                            color: scorePercent >= 80
                                ? AppTheme.primaryColor
                                : AppTheme.secondaryColor,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '+${prog.xpEarned} XP',
                        style: textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _formatDateTime(prog.completedAt).split(' ')[0],
                        style: textTheme.bodyMedium?.copyWith(
                          fontSize: 10,
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 4),
                ],
              ),
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Column(
                    children: [
                      _buildDetailRow('Điểm số cao nhất', '${prog.bestScore.toInt()} / 100', textTheme),
                      const SizedBox(height: 8),
                      _buildDetailRow('Số lần luyện tập', '${prog.attemptsCount} lần', textTheme),
                      const SizedBox(height: 8),
                      _buildDetailRow('Tổng thời gian học', _formatDuration(prog.totalTimeSeconds), textTheme),
                      const SizedBox(height: 8),
                      _buildDetailRow('Thời gian hoàn thành', _formatDateTime(prog.completedAt), textTheme),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value, TextTheme textTheme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: textTheme.bodyMedium?.copyWith(
            fontSize: 12,
            color: AppTheme.onSurfaceVariant,
          ),
        ),
        Text(
          value,
          style: textTheme.bodyMedium?.copyWith(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}
