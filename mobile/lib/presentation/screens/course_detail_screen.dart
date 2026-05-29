import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../bloc/course_bloc.dart';
import '../../core/theme/app_theme.dart';
import 'lesson_detail_screen.dart';

class CourseDetailScreen extends StatefulWidget {
  final int courseId;
  const CourseDetailScreen({super.key, required this.courseId});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  @override
  void initState() {
    super.initState();
    context.read<CourseBloc>().add(LoadCourseDetailRequested(widget.courseId));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.bgGradient),
        child: BlocBuilder<CourseBloc, CourseState>(
          builder: (context, state) {
            if (state is CourseLoading) {
              return const Center(child: CircularProgressIndicator());
            } else if (state is CourseFailure) {
              return SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Không thể tải chi tiết khóa học: ${state.error}"),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          context.read<CourseBloc>().add(LoadCourseDetailRequested(widget.courseId));
                        },
                        child: const Text("Thử lại"),
                      ),
                    ],
                  ),
                ),
              );
            } else if (state is CourseDetailLoadSuccess) {
              final course = state.course;
              final lessons = state.lessons;

              return CustomScrollView(
                slivers: [
                  // App Bar with Dynamic Title
                  SliverAppBar(
                    expandedHeight: 180,
                    pinned: true,
                    flexibleSpace: FlexibleSpaceBar(
                      title: Text(
                        course.title,
                        style: GoogleFonts.quicksand(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontSize: 16,
                          shadows: [
                            const Shadow(color: Colors.black45, blurRadius: 4),
                          ],
                        ),
                      ),
                      background: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [AppTheme.primaryColor, AppTheme.primaryDark],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: const Center(
                          child: Icon(Icons.import_contacts_rounded, size: 64, color: Colors.white24),
                        ),
                      ),
                    ),
                  ),

                  // Course Overview Card
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Card(
                            margin: EdgeInsets.zero,
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                                          const SizedBox(width: 4),
                                          Text(
                                            course.averageRating.toStringAsFixed(1),
                                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                                          ),
                                        ],
                                      ),
                                      _buildLevelBadge(course.level ?? 'Cơ bản'),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    "Mô tả khóa học",
                                    style: theme.textTheme.titleLarge?.copyWith(fontSize: 15, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    course.description,
                                    style: theme.textTheme.bodyMedium?.copyWith(height: 1.4),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Lessons List Header
                          Text(
                            "Danh sách bài học (${lessons.length})",
                            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                        ],
                      ),
                    ),
                  ),

                  // Lessons Scrollable List
                  SliverPadding(
                    padding: const EdgeInsets.only(left: 20.0, right: 20.0, bottom: 32.0),
                    sliver: lessons.isEmpty
                        ? const SliverToBoxAdapter(
                            child: Center(
                              child: Text(
                                "Khóa học này hiện chưa cập nhật bài học.",
                                style: TextStyle(fontStyle: FontStyle.italic, color: Color(0xFF64748B)),
                              ),
                            ),
                          )
                        : SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final lesson = lessons[index];
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: InkWell(
                                    onTap: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => LessonDetailScreen(lesson: lesson),
                                        ),
                                      );
                                    },
                                    borderRadius: BorderRadius.circular(16.0),
                                    child: Container(
                                      padding: const EdgeInsets.all(16.0),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(16.0),
                                        border: Border.all(color: const Color(0xFFEDF6E4), width: 1.5),
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppTheme.primaryColor.withOpacity(0.02),
                                            blurRadius: 10,
                                            offset: const Offset(0, 4),
                                          ),
                                        ],
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 36,
                                            height: 36,
                                            decoration: BoxDecoration(
                                              color: AppTheme.primarySubtle,
                                              shape: BoxShape.circle,
                                            ),
                                            child: Center(
                                              child: Text(
                                                "${index + 1}",
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  color: AppTheme.primaryColor,
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  lesson.title,
                                                  style: theme.textTheme.bodyLarge?.copyWith(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 14,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  "Phần thưởng: +${lesson.xpEarned} XP",
                                                  style: TextStyle(
                                                    color: theme.primaryColor,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 11,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const Icon(Icons.play_circle_fill_rounded, color: AppTheme.primaryColor, size: 28),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                              childCount: lessons.length,
                            ),
                          ),
                  ),
                ],
              );
            }
            return const SizedBox();
          },
        ),
      ),
    );
  }

  Widget _buildLevelBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.primarySubtle,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: AppTheme.primaryColor,
          fontWeight: FontWeight.bold,
          fontSize: 11,
        ),
      ),
    );
  }
}
