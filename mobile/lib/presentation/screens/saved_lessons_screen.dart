import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';
import '../../data/datasources/course_data_source.dart';
import '../../data/models/lesson_model.dart';
import '../../data/models/course_model.dart';
import '../widgets/course_image_widget.dart';
import 'lesson_detail_screen.dart';

class SavedLessonsScreen extends StatefulWidget {
  const SavedLessonsScreen({super.key});

  @override
  State<SavedLessonsScreen> createState() => _SavedLessonsScreenState();
}

class _SavedLessonsScreenState extends State<SavedLessonsScreen> {
  List<Map<String, dynamic>> _savedItems = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSavedLessons();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadSavedLessons() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    try {
      final ds = context.read<CourseDataSource>();
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('auth_user_id') ?? 1;

      // 1. Fetch bookmarked lesson IDs from backend
      final savedIds = await ds.getBookmarkedLessonIds(userId);

      // 2. Fetch all courses
      final courses = await ds.getCourses();

      // 3. Fetch lessons for each course and check if bookmarked on backend
      final List<Map<String, dynamic>> tempSaved = [];
      for (var course in courses) {
        final lessons = await ds.getLessons(course.id);
        for (var lesson in lessons) {
          if (savedIds.contains(lesson.id)) {
            tempSaved.add({
              'lesson': lesson,
              'course': course,
            });
          }
        }
      }

      if (mounted) {
        setState(() {
          _savedItems = tempSaved;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi tải bài học đã lưu: $e'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _removeBookmark(int lessonId) async {
    try {
      final ds = context.read<CourseDataSource>();
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('auth_user_id') ?? 1;

      final matchedItem = _savedItems.firstWhere((item) => (item['lesson'] as LessonModel).id == lessonId);
      final lesson = matchedItem['lesson'] as LessonModel;

      final success = await ds.toggleBookmark(userId, lessonId, lesson.title, lesson.content);
      if (success) {
        setState(() {
          _savedItems.removeWhere((item) => (item['lesson'] as LessonModel).id == lessonId);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã xóa bài học khỏi mục lưu từ!'),
              backgroundColor: Color(0xFF10B981),
              behavior: SnackBarBehavior.floating,
              duration: Duration(seconds: 1),
            ),
          );
        }
      } else {
        throw Exception('Không thể cập nhật trên máy chủ.');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi xóa bài học đã lưu: $e'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color mintColor = Color(0xFF10B981);

    final filteredItems = _savedItems.where((item) {
      final lesson = item['lesson'] as LessonModel;
      final course = item['course'] as CourseModel;
      return lesson.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          course.title.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return ValueListenableBuilder<bool>(
      valueListenable: AppTheme.isWhiteBgNotifier,
      builder: (context, isWhiteBg, child) {
        final Color currentBgColor = isWhiteBg ? const Color(0xFFF8FDF8) : const Color(0xFF0A0F0D);
        final Color currentCardColor = isWhiteBg ? const Color(0xFFE8F5E9) : const Color(0xFF131A16);
        final Color currentTextColor = isWhiteBg ? const Color(0xFF1E293B) : Colors.white;
        final Color currentTextMutedColor = isWhiteBg ? const Color(0xFF64748B) : const Color(0xFF94A3B8);

        return Scaffold(
          backgroundColor: currentBgColor,
          appBar: AppBar(
            automaticallyImplyLeading: false,
            backgroundColor: currentBgColor,
            elevation: 0,
            title: Text(
              "BÀI HỌC ĐÃ LƯU",
              style: GoogleFonts.quicksand(
                fontWeight: FontWeight.bold,
                color: currentTextColor,
                fontSize: 18,
              ),
            ),
            centerTitle: true,
          ),
          body: Column(
            children: [
              // Search input
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val.trim();
                    });
                  },
                  style: TextStyle(color: currentTextColor),
                  decoration: InputDecoration(
                    hintText: 'Tìm bài học hoặc khóa học đã lưu...',
                    hintStyle: TextStyle(color: currentTextColor.withValues(alpha: 0.5), fontSize: 13),
                    fillColor: currentCardColor,
                    filled: true,
                    prefixIcon: Icon(Icons.search_rounded, color: currentTextColor.withValues(alpha: 0.5), size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: Icon(Icons.clear_rounded, color: currentTextColor.withValues(alpha: 0.5), size: 18),
                            onPressed: () {
                              setState(() {
                                _searchController.clear();
                                _searchQuery = '';
                              });
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16.0),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),

              // Saved items content
              Expanded(
                child: RefreshIndicator(
                  onRefresh: _loadSavedLessons,
                  color: mintColor,
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator(color: mintColor))
                      : filteredItems.isEmpty
                          ? ListView(
                              children: [
                                SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                                Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: mintColor.withValues(alpha: 0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.bookmark_border_rounded, size: 36, color: mintColor),
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        'Chưa có bài học nào được lưu.',
                                        style: TextStyle(color: currentTextMutedColor, fontSize: 13, fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        'Hãy ấn vào biểu tượng lưu khi xem chi tiết bài học.',
                                        style: TextStyle(color: currentTextColor.withValues(alpha: 0.3), fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(20),
                              itemCount: filteredItems.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final item = filteredItems[index];
                                final lesson = item['lesson'] as LessonModel;
                                final course = item['course'] as CourseModel;

                                return Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: currentCardColor,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                                  ),
                                  child: Row(
                                    children: [
                                      // Course image
                                      CourseImageWidget(
                                        coverMediaId: course.thumbnailMediaId,
                                        title: course.title,
                                        size: 54,
                                      ),
                                      const SizedBox(width: 12),

                                      // Titles
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              lesson.title,
                                              style: TextStyle(color: currentTextColor, fontWeight: FontWeight.bold, fontSize: 14),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              course.title,
                                              style: TextStyle(color: currentTextMutedColor, fontSize: 11),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 6),
                                            Row(
                                              children: [
                                                const Icon(Icons.bolt_rounded, color: Colors.amber, size: 12),
                                                const SizedBox(width: 2),
                                                Text(
                                                  "+${lesson.xpEarned} XP",
                                                  style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 10),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),

                                      // Action Buttons
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          // Learn now button
                                          IconButton(
                                            icon: const Icon(Icons.play_circle_fill_rounded, color: mintColor, size: 28),
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => LessonDetailScreen(lesson: lesson),
                                                ),
                                              ).then((_) => _loadSavedLessons());
                                            },
                                            tooltip: 'Học ngay',
                                          ),
                                          // Delete button
                                          IconButton(
                                            icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                                            onPressed: () => _removeBookmark(lesson.id),
                                            tooltip: 'Xóa khỏi lưu từ',
                                          ),
                                        ],
                                      )
                                    ],
                                  ),
                                );
                              },
                            ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
