import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../bloc/course_bloc.dart';
import '../../data/datasources/course_data_source.dart';
import 'lesson_detail_screen.dart';

class CourseDetailScreen extends StatefulWidget {
  final int courseId;
  const CourseDetailScreen({super.key, required this.courseId});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  // Review System States
  int? _userId;
  int? _courseCategoryId;
  List<dynamic> _allReviews = [];
  List<dynamic> _filteredReviews = [];
  String _activeFilter = 'all';
  bool _isLoadingReviews = true;
  String? _coverImageUrl;
  bool _isLoadingCoverImage = false;

  // Star and Comment stats
  int _countAll = 0;
  int _count5 = 0;
  int _count4 = 0;
  int _count3 = 0;
  int _count2 = 0;
  int _count1 = 0;
  int _countComment = 0;

  @override
  void initState() {
    super.initState();
    context.read<CourseBloc>().add(LoadCourseDetailRequested(widget.courseId));
    _loadUserInfo();
    _loadReviewsAndCategories();
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userId = prefs.getInt('auth_user_id');
    });
  }

  Future<void> _loadCoverImage(int? mediaId, String title) async {
    if (mediaId == null) {
      if (mounted) {
        setState(() {
          _coverImageUrl = "https://ui-avatars.com/api/?name=${Uri.encodeComponent(title)}&background=10b981&color=fff&size=500";
        });
      }
      return;
    }
    try {
      final ds = context.read<CourseDataSource>();
      final url = await ds.getVideoUrl(mediaId);
      if (url != null && url.isNotEmpty) {
        if (mounted) {
          setState(() {
            _coverImageUrl = url;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _coverImageUrl = "https://ui-avatars.com/api/?name=${Uri.encodeComponent(title)}&background=10b981&color=fff&size=500";
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _coverImageUrl = "https://ui-avatars.com/api/?name=${Uri.encodeComponent(title)}&background=10b981&color=fff&size=500";
        });
      }
    }
  }

  Future<void> _loadReviewsAndCategories() async {
    try {
      final ds = context.read<CourseDataSource>();
      // 1. Get categories
      final cats = await ds.getFeedbackCategories();
      final courseCat = cats.firstWhere((c) => c['name'] == 'Course', orElse: () => null);
      if (courseCat != null) {
        _courseCategoryId = courseCat['id'] as int?;
      }
      
      // 2. Get feedbacks
      final all = await ds.getFeedbacks();
      setState(() {
        _allReviews = all.where((r) => 
          r['categoryId'] == _courseCategoryId && 
          r['subject'] == 'CourseId:${widget.courseId}'
        ).toList();
        
        _calculateStats();
        _applyFilter();
        _isLoadingReviews = false;
      });
    } catch (_) {
      setState(() {
        _isLoadingReviews = false;
      });
    }
  }

  void _calculateStats() {
    _countAll = _allReviews.length;
    _count5 = _allReviews.where((r) => r['rating'] == 5).length;
    _count4 = _allReviews.where((r) => r['rating'] == 4).length;
    _count3 = _allReviews.where((r) => r['rating'] == 3).length;
    _count2 = _allReviews.where((r) => r['rating'] == 2).length;
    _count1 = _allReviews.where((r) => r['rating'] == 1).length;
    _countComment = _allReviews.where((r) => r['content'] != null && r['content'].toString().trim().isNotEmpty).length;
  }

  void _applyFilter() {
    if (_activeFilter == 'all') {
      _filteredReviews = _allReviews;
    } else if (_activeFilter == 'comment') {
      _filteredReviews = _allReviews.where((r) => r['content'] != null && r['content'].toString().trim().isNotEmpty).toList();
    } else {
      final ratingNum = int.tryParse(_activeFilter) ?? 5;
      _filteredReviews = _allReviews.where((r) => r['rating'] == ratingNum).toList();
    }
  }

  // Submit course review
  Future<void> _submitReview(int rating, String comment) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    if (_userId == null) {
      scaffoldMessenger.showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để gửi đánh giá!'), behavior: SnackBarBehavior.floating),
      );
      return;
    }

    if (_courseCategoryId == null) {
      scaffoldMessenger.showSnackBar(
        const SnackBar(content: Text('Lỗi danh mục đánh giá khóa học!'), behavior: SnackBarBehavior.floating),
      );
      return;
    }

    setState(() {
      _isLoadingReviews = true;
    });

    try {
      final ds = context.read<CourseDataSource>();
      final success = await ds.submitFeedback(
        userId: _userId!,
        categoryId: _courseCategoryId!,
        rating: rating,
        subject: 'CourseId:${widget.courseId}',
        content: comment,
      );

      if (success) {
        scaffoldMessenger.showSnackBar(
          const SnackBar(
            content: Text('Đánh giá khóa học của bạn thành công!'),
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
        await _loadReviewsAndCategories();
      } else {
        scaffoldMessenger.showSnackBar(
          const SnackBar(
            content: Text('Đăng đánh giá thất bại. Vui lòng thử lại.'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
        setState(() {
          _isLoadingReviews = false;
        });
      }
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Lỗi: $e'),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
      setState(() {
        _isLoadingReviews = false;
      });
    }
  }

  // Modal Sheet for writing a review
  void _showWriteReviewBottomSheet() {
    int selectedStars = 5;
    final commentController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF131A16),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
                left: 20,
                right: 20,
                top: 24,
              ),
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Viết đánh giá của bạn',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, color: Colors.white60),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Stars Selector
                    const Center(
                      child: Text(
                        'Điểm số sao',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        final starValue = index + 1;
                        return IconButton(
                          icon: Icon(
                            starValue <= selectedStars ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: Colors.amber,
                            size: 36,
                          ),
                          onPressed: () {
                            setModalState(() {
                              selectedStars = starValue;
                            });
                          },
                        );
                      }),
                    ),
                    const SizedBox(height: 16),
                    // Comment input
                    TextFormField(
                      controller: commentController,
                      maxLines: 4,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Chia sẻ ý kiến đánh giá về khóa học...',
                        hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                        fillColor: const Color(0xFF0F1412),
                        filled: true,
                        contentPadding: const EdgeInsets.all(16),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Vui lòng điền nội dung đánh giá.';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        if (formKey.currentState!.validate()) {
                          Navigator.pop(ctx);
                          _submitReview(selectedStars, commentController.text.trim());
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Gửi đánh giá', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    // Dark theme aesthetics matching premium Figma screens
    const Color darkBgColor = Color(0xFF0A0F0D);
    const Color darkCardColor = Color(0xFF131A16);
    const Color mintColor = Color(0xFF10B981);
    const Color textMutedColor = Color(0xFF94A3B8);

    return Scaffold(
      backgroundColor: darkBgColor,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [darkBgColor, Color(0xFF0E1411)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: BlocBuilder<CourseBloc, CourseState>(
          builder: (context, state) {
            if (state is CourseLoading) {
              return const Center(child: CircularProgressIndicator(color: mintColor));
            } else if (state is CourseFailure) {
              return SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Không thể tải chi tiết khóa học: ${state.error}", style: const TextStyle(color: Colors.redAccent)),
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

              // Load the cover image dynamically once details succeed
              if (_coverImageUrl == null && !_isLoadingCoverImage) {
                _isLoadingCoverImage = true;
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  _loadCoverImage(course.thumbnailMediaId, course.title);
                });
              }

              return CustomScrollView(
                slivers: [
                  // App Bar with Dynamic Title
                  SliverAppBar(
                    expandedHeight: 180,
                    pinned: true,
                    backgroundColor: darkCardColor,
                    flexibleSpace: FlexibleSpaceBar(
                      title: Text(
                        course.title,
                        style: GoogleFonts.quicksand(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontSize: 16,
                          shadows: [
                            const Shadow(color: Color(0xD8000000), blurRadius: 4),
                          ],
                        ),
                      ),
                      background: _coverImageUrl != null
                          ? Image.network(
                              _coverImageUrl!,
                              fit: BoxFit.cover,
                            )
                          : Container(
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [Color(0xFF0E1E16), Color(0xFF0C100E)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                              child: const Center(
                                child: Icon(Icons.school_rounded, size: 64, color: Colors.white24),
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
                                    Row(
                                      children: [
                                        const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                                        const SizedBox(width: 4),
                                        Text(
                                          course.averageRating.toStringAsFixed(1),
                                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14),
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          "($_countAll đánh giá)",
                                          style: const TextStyle(color: textMutedColor, fontSize: 11),
                                        ),
                                      ],
                                    ),
                                    _buildLevelBadge(course.level ?? 'Cơ bản', mintColor),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  "Mô tả khóa học",
                                  style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  course.description,
                                  style: const TextStyle(color: textMutedColor, fontSize: 13, height: 1.45),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Lessons List Header
                          Text(
                            "Danh sách bài học (${lessons.length})",
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                        ],
                      ),
                    ),
                  ),

                  // Lessons Scrollable List
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
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
                                        color: darkCardColor,
                                        borderRadius: BorderRadius.circular(16.0),
                                        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 32,
                                            height: 32,
                                            decoration: BoxDecoration(
                                              color: mintColor.withValues(alpha: 0.1),
                                              shape: BoxShape.circle,
                                            ),
                                            child: Center(
                                              child: Text(
                                                "${index + 1}",
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  color: mintColor,
                                                  fontSize: 13,
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
                                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  "Phần thưởng: +${lesson.xpEarned} XP",
                                                  style: const TextStyle(
                                                    color: mintColor,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 11,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const Icon(Icons.play_circle_fill_rounded, color: mintColor, size: 28),
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

                  // Shopee-style Course Review Section (Title & Counter tags)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Divider(color: Colors.white.withValues(alpha: 0.05)),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                "Đánh giá & Nhận xét",
                                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              ElevatedButton.icon(
                                onPressed: _showWriteReviewBottomSheet,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: mintColor,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                ),
                                icon: const Icon(Icons.rate_review_rounded, size: 14),
                                label: const Text('Viết đánh giá', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Shopee rating tags scrollable horizontal view
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                _buildReviewFilterTag('Tất cả ($_countAll)', 'all', mintColor),
                                const SizedBox(width: 8),
                                _buildReviewFilterTag('5 ★ ($_count5)', '5', mintColor),
                                const SizedBox(width: 8),
                                _buildReviewFilterTag('4 ★ ($_count4)', '4', mintColor),
                                const SizedBox(width: 8),
                                _buildReviewFilterTag('3 ★ ($_count3)', '3', mintColor),
                                const SizedBox(width: 8),
                                _buildReviewFilterTag('2 ★ ($_count2)', '2', mintColor),
                                const SizedBox(width: 8),
                                _buildReviewFilterTag('1 ★ ($_count1)', '1', mintColor),
                                const SizedBox(width: 8),
                                _buildReviewFilterTag('Có bình luận ($_countComment)', 'comment', mintColor),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                      ),
                    ),
                  ),

                  // Reviews List
                  SliverPadding(
                    padding: const EdgeInsets.only(left: 20.0, right: 20.0, bottom: 48.0),
                    sliver: _isLoadingReviews
                        ? const SliverToBoxAdapter(
                            child: Center(
                              child: Padding(
                                padding: EdgeInsets.all(24.0),
                                child: CircularProgressIndicator(color: mintColor),
                              ),
                            ),
                          )
                        : _filteredReviews.isEmpty
                            ? const SliverToBoxAdapter(
                                child: Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(24.0),
                                    child: Text('Chưa có đánh giá nào phù hợp với bộ lọc.', style: TextStyle(color: Colors.white30, fontSize: 13)),
                                  ),
                                ),
                              )
                            : SliverList(
                                delegate: SliverChildBuilderDelegate(
                                  (context, index) {
                                    final review = _filteredReviews[index];
                                    final dynamic userAvatar = review['userAvatarUrl'];
                                    final userFullName = review['userFullName'] ?? 'Học viên VSL';
                                    final reviewText = review['content'] ?? '';
                                    final rating = review['rating'] ?? 5;
                                    final adminReply = review['adminReply'];

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 12),
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: darkCardColor,
                                        borderRadius: BorderRadius.circular(18),
                                        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Container(
                                                width: 36,
                                                height: 36,
                                                decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: mintColor.withValues(alpha: 0.15),
                                                  border: Border.all(color: mintColor.withValues(alpha: 0.2)),
                                                ),
                                                child: userAvatar != null 
                                                    ? ClipRRect(
                                                        borderRadius: BorderRadius.circular(18),
                                                        child: Image.network(userAvatar, fit: BoxFit.cover),
                                                      )
                                                    : const Center(child: Icon(Icons.person_rounded, color: mintColor, size: 18)),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      userFullName,
                                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                                    ),
                                                    const SizedBox(height: 2),
                                                    Row(
                                                      children: List.generate(5, (starIdx) {
                                                        return Icon(
                                                          starIdx < rating ? Icons.star_rounded : Icons.star_outline_rounded,
                                                          color: Colors.amber,
                                                          size: 13,
                                                        );
                                                      }),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                          if (reviewText.toString().isNotEmpty) ...[
                                            const SizedBox(height: 10),
                                            Text(
                                              reviewText,
                                              style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                                            ),
                                          ],
                                          
                                          // Admin Reply Card (linked directly from C# feedback replies database)
                                          if (adminReply != null && adminReply.toString().trim().isNotEmpty) ...[
                                            const SizedBox(height: 12),
                                            Container(
                                              width: double.infinity,
                                              padding: const EdgeInsets.all(12),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF0F1412),
                                                borderRadius: BorderRadius.circular(12),
                                                border: Border.all(color: mintColor.withValues(alpha: 0.1)),
                                              ),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  const Row(
                                                    children: [
                                                      Icon(Icons.admin_panel_settings_rounded, color: mintColor, size: 14),
                                                      SizedBox(width: 6),
                                                      Text(
                                                        'Phản hồi từ Admin',
                                                        style: TextStyle(color: mintColor, fontSize: 11, fontWeight: FontWeight.bold),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 6),
                                                  Text(
                                                    adminReply,
                                                    style: const TextStyle(color: Colors.white60, fontSize: 12, height: 1.4, fontStyle: FontStyle.italic),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    );
                                  },
                                  childCount: _filteredReviews.length,
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

  Widget _buildLevelBadge(String label, Color mintColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: mintColor.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: mintColor,
          fontWeight: FontWeight.bold,
          fontSize: 11,
        ),
      ),
    );
  }

  Widget _buildReviewFilterTag(String label, String value, Color mintColor) {
    final isSelected = _activeFilter == value;
    return InkWell(
      onTap: () {
        setState(() {
          _activeFilter = value;
          _applyFilter();
        });
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? mintColor : const Color(0xFF131A16),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? mintColor : Colors.white.withValues(alpha: 0.08)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
