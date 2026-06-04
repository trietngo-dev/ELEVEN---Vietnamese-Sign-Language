import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';

import '../bloc/auth_bloc.dart';
import '../bloc/course_bloc.dart';
import '../../data/datasources/course_data_source.dart';
import '../../data/datasources/profile_data_source.dart';
import '../../data/models/lesson_model.dart';
import '../../data/models/badge_model.dart';
import '../widgets/course_image_widget.dart';
import 'course_detail_screen.dart';
import 'gesture_test_screen.dart';
import 'login_screen.dart';
import 'saved_lessons_screen.dart';
import 'frame_shop_screen.dart';
import 'notifications_screen.dart';
import 'subscription_payment_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  String _userName = 'Học viên';
  String _userEmail = 'hocvien@vsl.vn';
  int _userXp = 100;
  int _userUserId = 1;

  // Avatar, frame, badges & streak states
  String _avatarUrl = 'https://api.dicebear.com/7.x/adventurer/png?seed=Triet';
  String? _activeFrameUrl;
  int _streakDays = 12;
  List<BadgeModel> _earnedBadges = [];

  // Helpdesk Form Fields
  final _supportFormKey = GlobalKey<FormState>();
  String _selectedSupportTopic = 'Tài khoản';
  final _supportContentController = TextEditingController();
  bool _isSubmittingSupport = false;

  // Search filter for Library tab
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadUserData();
    context.read<CourseBloc>().add(LoadCoursesRequested());
  }

  @override
  void dispose() {
    _supportContentController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _userName = prefs.getString('auth_user_name') ?? 'Học viên VSL';
      _userEmail = prefs.getString('auth_user_email') ?? 'hocvien@vsl.vn';
      _userXp = prefs.getInt('auth_user_xp') ?? 100;
      _userUserId = prefs.getInt('auth_user_id') ?? 1;
      _avatarUrl = prefs.getString('auth_user_avatar_url') ?? 'https://api.dicebear.com/7.x/adventurer/png?seed=Triet';
      _activeFrameUrl = prefs.getString('auth_user_active_frame_url');
      _streakDays = prefs.getInt('auth_user_streak') ?? 12;
    });

    try {
      final ds = context.read<ProfileDataSource>();
      
      // Post login log on mobile startup/load to sync consecutive days streak
      try {
        await ds.postLoginActivityLog(_userUserId);
      } catch (_) {}

      final profile = await ds.getUserProfile(_userUserId);
      final liveXp = (profile['totalXp'] ?? profile['TotalXp'] ?? _userXp) as int;
      final liveStreak = (profile['currentStreakDays'] ?? profile['CurrentStreakDays'] ?? _streakDays) as int;
      final activeFrameId = profile['activeFrameId'] ?? profile['ActiveFrameId'];

      // Fetch user details for real email & avatar
      final userDetails = await ds.getUserDetails(_userUserId);
      final liveEmail = (userDetails['email'] ?? userDetails['Email'] ?? _userEmail) as String;
      final int? avatarMediaId = userDetails['avatarMediaId'] ?? userDetails['AvatarMediaId'];
      
      String liveAvatarUrl = _avatarUrl;
      if (avatarMediaId != null) {
        final mediaAsset = await ds.getMediaAsset(avatarMediaId);
        liveAvatarUrl = (mediaAsset['fileUrl'] ?? mediaAsset['FileUrl'] ?? _avatarUrl) as String;
      }

      String? matchedFrameUrl;
      if (activeFrameId != null) {
        final allFrames = await ds.getAvatarFrames();
        final matched = allFrames.firstWhere((f) => f.id == activeFrameId, orElse: () => allFrames.first);
        matchedFrameUrl = matched.fullImageUrl;
      }

      final badges = await ds.getUserEarnedBadges();

      if (mounted) {
        setState(() {
          _userXp = liveXp;
          _streakDays = liveStreak;
          _userEmail = liveEmail;
          _activeFrameUrl = matchedFrameUrl;
          _avatarUrl = liveAvatarUrl;
          _earnedBadges = badges;
        });

        await prefs.setInt('auth_user_xp', _userXp);
        await prefs.setInt('auth_user_streak', _streakDays);
        await prefs.setString('auth_user_avatar_url', _avatarUrl);
        await prefs.setString('auth_user_email', _userEmail);
        if (matchedFrameUrl != null) {
          await prefs.setString('auth_user_active_frame_url', matchedFrameUrl);
        } else {
          await prefs.remove('auth_user_active_frame_url');
        }
      }
    } catch (_) {
      if (_earnedBadges.isEmpty && mounted) {
        setState(() {
          _earnedBadges = [
            BadgeModel(id: 1, code: 'FIRST_LESSON', name: 'Bắt Đầu', description: 'Hoàn thành bài học đầu tiên'),
            BadgeModel(id: 2, code: 'STREAK_3', name: 'Kiên Trì', description: 'Đạt chuỗi học tập 3 ngày'),
          ];
        });
      }
    }
  }

  Widget _buildAvatarWithFrame({required double size, String? frameUrl, required String avatarUrl}) {
    final double avatarSize = size * 0.76;
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ClipOval(
            child: avatarUrl.startsWith('http')
                ? Image.network(
                    avatarUrl,
                    width: avatarSize,
                    height: avatarSize,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Image.network(
                        "https://ui-avatars.com/api/?name=${Uri.encodeComponent(_userName)}&background=10b981&color=fff&size=200",
                        width: avatarSize,
                        height: avatarSize,
                        fit: BoxFit.cover,
                      );
                    },
                  )
                : const Icon(Icons.person, size: 24, color: Colors.white70),
          ),
          if (frameUrl != null && frameUrl.isNotEmpty)
            Positioned.fill(
              child: Image.network(
                frameUrl,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const SizedBox(),
              ),
            ),
        ],
      ),
    );
  }

  // Submit helpdesk support feedback
  Future<void> _submitSupportRequest() async {
    if (!_supportFormKey.currentState!.validate()) return;
    
    setState(() {
      _isSubmittingSupport = true;
    });

    try {
      final ds = context.read<CourseDataSource>();
      // 1. Fetch categories to find 'Support' id
      final cats = await ds.getFeedbackCategories();
      final supportCat = cats.firstWhere((c) => c['name'] == 'Support', orElse: () => null);
      final int supportCatId = supportCat != null ? supportCat['id'] as int : 2; // Default fallback to 2

      // 2. Submit feedback
      final success = await ds.submitFeedback(
        userId: _userUserId,
        categoryId: supportCatId,
        rating: 5, // Default/Dummy rating for support request
        subject: 'Support:$_selectedSupportTopic',
        content: _supportContentController.text.trim(),
      );

      if (mounted) {
        if (success) {
          _supportContentController.clear();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Gửi yêu cầu hỗ trợ thành công! Quản trị viên sẽ phản hồi bạn sớm.'),
              backgroundColor: Color(0xFF10B981),
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Gửi yêu cầu thất bại. Vui lòng thử lại.'),
              backgroundColor: Colors.redAccent,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
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
    } finally {
      if (mounted) {
        setState(() {
          _isSubmittingSupport = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Dark theme matching Figma screenshots
    const Color darkBgColor = Color(0xFF0A0F0D);
    const Color darkCardColor = Color(0xFF131A16);
    const Color mintColor = Color(0xFF10B981);
    const Color textMutedColor = Color(0xFF94A3B8);

    return Scaffold(
      backgroundColor: darkBgColor,
      appBar: _currentIndex == 0 || _currentIndex == 1 || _currentIndex == 4
          ? AppBar(
              automaticallyImplyLeading: false,
              backgroundColor: darkBgColor,
              elevation: 0,
              title: Row(
                children: [
                  ClipOval(
                    child: Image.asset(
                      'assets/logo.jpg',
                      width: 28,
                      height: 28,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    "ELEVEN",
                    style: GoogleFonts.quicksand(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontSize: 16,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),

              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_rounded, color: Colors.white70),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const NotificationsScreen(),
                      ),
                    ).then((_) => _loadUserData());
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.logout_rounded, color: Colors.white70),
                  onPressed: () {
                    context.read<AuthBloc>().add(AuthLogoutRequested());
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                  },
                ),
              ],
            )
          : null,
      body: _buildActiveTabBody(darkBgColor, darkCardColor, mintColor, textMutedColor),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          _loadUserData();
        },
        backgroundColor: darkCardColor,
        selectedItemColor: mintColor,
        unselectedItemColor: textMutedColor,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Trang chủ',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.menu_book_rounded),
            label: 'Thư viện',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bookmark_rounded),
            label: 'Đã lưu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.storefront_rounded),
            label: 'Cửa hàng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: 'Cá nhân',
          ),
        ],
      ),
    );
  }

  Widget _buildActiveTabBody(Color darkBg, Color cardBg, Color mint, Color muted) {
    switch (_currentIndex) {
      case 0:
        return _buildHomeTab(darkBg, cardBg, mint, muted);
      case 1:
        return _buildLibraryTab(darkBg, cardBg, mint, muted);
      case 2:
        return const SavedLessonsScreen();
      case 3:
        return const FrameShopScreen();
      case 4:
        return _buildProfileTab(darkBg, cardBg, mint, muted);
      default:
        return _buildHomeTab(darkBg, cardBg, mint, muted);
    }
  }

  // --- TAB 1: HOME ---
  Widget _buildHomeTab(Color darkBg, Color cardBg, Color mint, Color muted) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<CourseBloc>().add(LoadCoursesRequested());
        await _loadUserData();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Dashboard User Progress Card (Figma style)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Chào mừng trở lại,",
                            style: TextStyle(color: muted, fontSize: 13),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _userName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      _buildAvatarWithFrame(
                        size: 50,
                        avatarUrl: _avatarUrl,
                        frameUrl: _activeFrameUrl,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _buildFigmaStatChip(Icons.local_fire_department_rounded, Colors.orange, "$_streakDays ngày liên tiếp"),
                      const SizedBox(width: 10),
                      _buildFigmaStatChip(Icons.bolt_rounded, Colors.amber, "$_userXp XP tích lũy"),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 2. AI Vision Hero Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24.0),
                gradient: LinearGradient(
                  colors: [mint.withValues(alpha: 0.8), const Color(0xFF0F5A3E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.redAccent,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        "AI VISION ACTIVE",
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Luyện tập & Dịch thuật AI",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    "Thực hành giao tiếp qua camera với tính năng chấm điểm và dịch cử chỉ tức thì bằng mô hình AI Gemini.",
                    style: TextStyle(
                      color: Color(0xCCFFFFFF),
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      final testLesson = LessonModel(
                        id: 999,
                        courseId: 999,
                        title: "Luyện Tập Tự Do",
                        content: "Chức năng luyện tập tự do để kiểm tra và nhận diện cử chỉ bằng AI.",
                        orderIndex: 1,
                        xpEarned: 0,
                      );
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => GestureTestScreen(lesson: testLesson),
                        ),
                      );
                    },
                    icon: const Icon(Icons.videocam_rounded, size: 16),
                    label: const Text(
                      "Bắt đầu Luyện tập AI",
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF0F5A3E),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 3. Popular Topics (Chủ đề phổ biến) Grid
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Chủ đề phổ biến",
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  "Xem tất cả",
                  style: TextStyle(color: mint, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.5,
              children: [
                _buildTopicCard(Icons.waving_hand_rounded, "Chào hỏi", "15 bài học", mint, cardBg),
                _buildTopicCard(Icons.tag_rounded, "Số đếm", "10 bài học", mint, cardBg),
                _buildTopicCard(Icons.family_restroom_rounded, "Gia đình", "20 bài học", mint, cardBg),
                _buildTopicCard(Icons.medical_services_rounded, "Y tế", "12 bài học", mint, cardBg),
              ],
            ),
            const SizedBox(height: 24),

            // 4. Enrolled Courses
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Khóa học của bạn",
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  "Đang học",
                  style: TextStyle(color: mint, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),

            BlocBuilder<CourseBloc, CourseState>(
              builder: (context, state) {
                if (state is CourseLoading) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24.0),
                      child: CircularProgressIndicator(color: mint),
                    ),
                  );
                } else if (state is CourseFailure) {
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16)),
                    child: Column(
                      children: [
                        Text("Không thể tải khóa học: ${state.error}", style: const TextStyle(color: Colors.redAccent)),
                        const SizedBox(height: 8),
                        OutlinedButton(
                          onPressed: () {
                            context.read<CourseBloc>().add(LoadCoursesRequested());
                          },
                          child: const Text("Thử lại"),
                        ),
                      ],
                    ),
                  );
                } else if (state is CoursesLoadSuccess) {
                  final list = state.courses;
                  if (list.isEmpty) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 24.0),
                        child: Text("Không có khóa học nào khả dụng.", style: TextStyle(color: Colors.white30)),
                      ),
                    );
                  }
                  
                  return ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: list.length > 2 ? 2 : list.length, // Show top 2 on home screen
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final course = list[index];
                      return InkWell(
                        onTap: () {
                          final courseBloc = context.read<CourseBloc>();
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => BlocProvider<CourseBloc>(
                                create: (context) => CourseBloc(context.read<CourseDataSource>()),
                                child: CourseDetailScreen(courseId: course.id),
                              ),
                            ),
                          ).then((_) {
                            if (mounted) {
                              courseBloc.add(LoadCoursesRequested());
                            }
                          });
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                          ),
                          child: Row(
                            children: [
                              CourseImageWidget(
                                coverMediaId: course.thumbnailMediaId,
                                title: course.title,
                                size: 56,
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      course.title,
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.star_rounded, color: Colors.amber, size: 13),
                                        const SizedBox(width: 3),
                                        Text(
                                          course.averageRating.toStringAsFixed(1),
                                          style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          "•  ${course.lessonsCount} bài học",
                                          style: const TextStyle(color: Color(0x80FFFFFF), fontSize: 11),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.chevron_right_rounded, color: Colors.white30),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                }
                return const SizedBox();
              },
            ),
          ],
        ),
      ),
    );
  }

  // --- TAB 2: LIBRARY (ALL COURSES WITH FULL DATA) ---
  Widget _buildLibraryTab(Color darkBg, Color cardBg, Color mint, Color muted) {
    return Column(
      children: [
        // Search & Filter header
        Padding(
          padding: const EdgeInsets.only(left: 20.0, right: 20.0, top: 16.0, bottom: 8.0),
          child: TextField(
            controller: _searchController,
            onChanged: (val) {
              setState(() {
                _searchQuery = val.trim().toLowerCase();
              });
            },
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Tìm kiếm khóa học...',
              hintStyle: const TextStyle(color: Color(0xFF64748B)),
              fillColor: cardBg,
              filled: true,
              prefixIcon: const Icon(Icons.search_rounded, color: Color(0x80FFFFFF)),
              suffixIcon: _searchQuery.isNotEmpty 
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, color: Color(0x80FFFFFF)),
                      onPressed: () {
                        setState(() {
                          _searchController.clear();
                          _searchQuery = '';
                        });
                      },
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16.0),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),

        // Courses list
        Expanded(
          child: BlocBuilder<CourseBloc, CourseState>(
            builder: (context, state) {
              if (state is CourseLoading) {
                return Center(child: CircularProgressIndicator(color: mint));
              } else if (state is CourseFailure) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Text('Lỗi: ${state.error}', style: const TextStyle(color: Colors.redAccent)),
                  ),
                );
              } else if (state is CoursesLoadSuccess) {
                final filteredList = state.courses.where((c) {
                  return c.title.toLowerCase().contains(_searchQuery) ||
                      (c.level != null && c.level!.toLowerCase().contains(_searchQuery));
                }).toList();

                if (filteredList.isEmpty) {
                  return const Center(
                    child: Text('Không tìm thấy khóa học nào phù hợp.', style: TextStyle(color: Colors.white30)),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: filteredList.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final course = filteredList[index];
                    return InkWell(
                      onTap: () {
                        final courseBloc = context.read<CourseBloc>();
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => BlocProvider<CourseBloc>(
                              create: (context) => CourseBloc(context.read<CourseDataSource>()),
                              child: CourseDetailScreen(courseId: course.id),
                            ),
                          ),
                        ).then((_) {
                          if (mounted) {
                            courseBloc.add(LoadCoursesRequested());
                          }
                        });
                      },
                      borderRadius: BorderRadius.circular(24),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Cover Row
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                CourseImageWidget(
                                  coverMediaId: course.thumbnailMediaId,
                                  title: course.title,
                                  size: 80,
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: mint.withValues(alpha: 0.15),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              course.level ?? 'Cơ bản',
                                              style: TextStyle(color: mint, fontSize: 10, fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          if (course.isPremium)
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: Colors.amber.withValues(alpha: 0.15),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: const Text(
                                                'PRO',
                                                style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                                              ),
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        course.title,
                                        style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        course.summary ?? course.description,
                                        style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Divider(color: Colors.white.withValues(alpha: 0.05)),
                            const SizedBox(height: 8),
                            // Meta Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.star_rounded, color: Colors.amber, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      course.averageRating.toStringAsFixed(1),
                                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      "(${course.averageRating > 0 ? 'Hoàn hảo' : 'Chưa có đánh giá'})",
                                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    const Icon(Icons.menu_book_rounded, color: Color(0xFF64748B), size: 13),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${course.lessonsCount} bài học',
                                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                                    ),
                                    const SizedBox(width: 12),
                                    const Icon(Icons.access_time_filled_rounded, color: Color(0xFF64748B), size: 13),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${course.totalHours.toStringAsFixed(1)} giờ',
                                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              }
              return const SizedBox();
            },
          ),
        ),
      ],
    );
  }

  // --- TAB 3: PROFILE & HELPDESK (HỒ SƠ VỚI ĐẦY ĐỦ CỘT NHƯ WEB) ---
  Widget _buildProfileTab(Color darkBg, Color cardBg, Color mint, Color muted) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Profile header info
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
            ),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    _buildAvatarWithFrame(
                      size: 80,
                      avatarUrl: _avatarUrl,
                      frameUrl: _activeFrameUrl,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () => _showAvatarEditSheet(context, mint, darkBg, cardBg),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: mint,
                            shape: BoxShape.circle,
                            border: Border.all(color: cardBg, width: 2),
                          ),
                          child: const Icon(
                            Icons.edit_rounded,
                            color: Colors.white,
                            size: 14,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  _userName,
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  _userEmail,
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                ),
                const SizedBox(height: 8),
              
              ],
            ),
          ),
          
          // Gold VIP Subscription Banner
          Container(
            margin: const EdgeInsets.only(top: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFBBF24), Color(0xFFD97706)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: Colors.white24,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.workspace_premium, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Nâng cấp tài khoản VIP PRO",
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        "Mở khóa các tính năng AI và Khung độc quyền",
                        style: TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 18),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const SubscriptionPaymentScreen(),
                      ),
                    ).then((_) => _loadUserData());
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 2. Streaks and XP Indicators Grid
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.local_fire_department_rounded, color: Colors.orange, size: 24),
                      const SizedBox(height: 8),
                      const Text('Chuỗi học tập', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                      const SizedBox(height: 2),
                      Text('$_streakDays Ngày', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.donut_large_rounded, color: Colors.cyan, size: 24),
                      SizedBox(height: 8),
                      Text('Độ thuần thục', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                      SizedBox(height: 2),
                      Text('75 %', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // 3. Weekly Activity Chart (Figma mockup representation)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Hoạt động tuần này',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'T2 - CN',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                // Visual graph bars matching Figma design
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _buildFigmaBar('T2', 40, mint),
                    _buildFigmaBar('T3', 60, mint),
                    _buildFigmaBar('T4', 20, mint),
                    _buildFigmaBar('T5', 80, mint),
                    _buildFigmaBar('T6', 50, mint),
                    _buildFigmaBar('T7', 10, mint),
                    _buildFigmaBar('CN', 30, mint),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Badges Grid View
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Huy hiệu đạt được',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${_earnedBadges.length} đạt được',
                      style: TextStyle(color: mint, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _earnedBadges.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 12.0),
                          child: Text(
                            'Chưa có huy hiệu nào.',
                            style: TextStyle(color: Colors.white24, fontSize: 12),
                          ),
                        ),
                      )
                    : GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                          childAspectRatio: 0.85,
                        ),
                        itemCount: _earnedBadges.length,
                        itemBuilder: (context, index) {
                          final badge = _earnedBadges[index];
                          return Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F1412),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.02)),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: Colors.amber.withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.military_tech_rounded, color: Colors.amber, size: 24),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  badge.name,
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  badge.description,
                                  style: const TextStyle(color: Colors.white30, fontSize: 8),
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 4. Interactive Support Form (Helpdesk - Gửi yêu cầu hỗ trợ)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
            ),
            child: Form(
              key: _supportFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: mint.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.help_center_rounded, color: mint, size: 18),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Gửi yêu cầu hỗ trợ',
                        style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Topic Dropdown
                  const Text('Chủ đề cần hỗ trợ', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F1412),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedSupportTopic,
                        dropdownColor: cardBg,
                        style: const TextStyle(color: Colors.white),
                        icon: Icon(Icons.keyboard_arrow_down_rounded, color: mint),
                        onChanged: (String? val) {
                          if (val != null) {
                            setState(() {
                              _selectedSupportTopic = val;
                            });
                          }
                        },
                        items: <String>['Tài khoản', 'Thanh toán', 'Lỗi kỹ thuật', 'Góp ý', 'Chủ đề khác']
                            .map<DropdownMenuItem<String>>((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Detail message input
                  const Text('Nội dung chi tiết', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _supportContentController,
                    maxLines: 4,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Mô tả chi tiết vấn đề bạn đang gặp phải...',
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
                        return 'Vui lòng nhập nội dung mô tả.';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  ElevatedButton(
                    onPressed: _isSubmittingSupport ? null : _submitSupportRequest,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: mint,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isSubmittingSupport 
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text('Gửi yêu cầu', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 5. App Setting Options Links
          Container(
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
            ),
            child: Column(
              children: [
                _buildFigmaOptionLink(Icons.settings_rounded, 'Cài đặt tài khoản', () {}),
                Divider(color: Colors.white.withValues(alpha: 0.04), height: 1),
                _buildFigmaOptionLink(Icons.info_outline_rounded, 'Chính sách bảo mật', () {}),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFigmaStatChip(IconData icon, Color color, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1412),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.15), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopicCard(IconData icon, String title, String subtitle, Color mintColor, Color cardBg) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: mintColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: mintColor, size: 18),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildFigmaBar(String day, double percentage, Color mint) {
    return Column(
      children: [
        Container(
          width: 14,
          height: 100,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(7),
          ),
          child: Stack(
            alignment: Alignment.bottomCenter,
            children: [
              Container(
                width: 14,
                height: percentage,
                decoration: BoxDecoration(
                  color: mint,
                  borderRadius: BorderRadius.circular(7),
                  boxShadow: [
                    BoxShadow(color: mint.withValues(alpha: 0.3), blurRadius: 4, offset: const Offset(0, 2)),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          day,
          style: const TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildFigmaOptionLink(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70, size: 20),
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
      trailing: const Icon(Icons.chevron_right_rounded, color: Colors.white30),
      onTap: onTap,
    );
  }

  void _showAvatarEditSheet(BuildContext context, Color mintColor, Color bg, Color cardBg) {
    showModalBottomSheet(
      context: context,
      backgroundColor: cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) {
        final List<Map<String, String>> presets = [
          {'name': 'Phiêu lưu', 'url': 'https://api.dicebear.com/7.x/adventurer/png?seed=Triet'},
          {'name': 'Vui nhộn', 'url': 'https://api.dicebear.com/7.x/fun-emoji/png?seed=Vsl'},
          {'name': 'Học viên', 'url': 'https://api.dicebear.com/7.x/avataaars/png?seed=Learner'},
          {'name': 'Pixel', 'url': 'https://api.dicebear.com/7.x/pixel-art/png?seed=Eleven'},
        ];

        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                "Chỉnh sửa ảnh đại diện & Khung",
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              const Text(
                "Chọn ảnh đại diện mẫu",
                style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 80,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: presets.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 16),
                  itemBuilder: (context, index) {
                    final item = presets[index];
                    final isSelected = _avatarUrl == item['url'];
                    return InkWell(
                      onTap: () async {
                        Navigator.of(context).pop();
                        await _updateAvatarUrl(item['url']!);
                      },
                      borderRadius: BorderRadius.circular(40),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected ? mintColor : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.white10,
                          backgroundImage: NetworkImage(item['url']!),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              const Divider(color: Colors.white12),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                  _pickAndUploadAvatar();
                },
                icon: const Icon(Icons.photo_library_rounded),
                label: const Text("Tải ảnh thật từ điện thoại"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: mintColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                  setState(() {
                    _currentIndex = 3; // Go to Frame Shop tab
                  });
                },
                icon: const Icon(Icons.storefront_rounded),
                label: const Text("Đi tới Cửa hàng khung"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: mintColor.withValues(alpha: 0.15),
                  foregroundColor: mintColor,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              const SizedBox(height: 12),

            ],
          ),
        );
      },
    );
  }

  Future<void> _updateAvatarUrl(String url) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    // Show a loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: Color(0xFF10B981)),
      ),

    );
    try {
      final ds = context.read<ProfileDataSource>();
      // 1. Download preset and upload to media assets
      final int mediaId = await ds.uploadPresetFromUrl(url);
      // 2. Associate avatar to user
      await ds.updateUserAvatar(_userUserId, mediaId);
      
      // Get the uploaded media asset url
      final mediaAsset = await ds.getMediaAsset(mediaId);
      final String liveUrl = mediaAsset['fileUrl'] ?? mediaAsset['FileUrl'] ?? url;

      if (mounted) {
        Navigator.of(context).pop(); // Dismiss loading
        setState(() {
          _avatarUrl = liveUrl;
        });
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_user_avatar_url', liveUrl);
      
      scaffoldMessenger.showSnackBar(
        const SnackBar(
          content: Text('Đã cập nhật ảnh đại diện thành công!'),
          backgroundColor: Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 1),
        ),
      );
    } catch (e) {
      if (mounted) {
        try {
          Navigator.of(context).pop(); // Dismiss loading
        } catch (_) {}
      }
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Lỗi cập nhật ảnh đại diện: $e'),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _pickAndUploadAvatar() async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    final picker = ImagePicker();
    try {
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );
      if (image == null) return;

      // Show loading
      if (!mounted) return;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(color: Color(0xFF10B981)),
        ),

      );

      final ds = context.read<ProfileDataSource>();
      // 1. Upload to media assets
      final uploadRes = await ds.uploadAvatar(image.path);
      final int mediaId = (uploadRes['id'] ?? uploadRes['Id']) as int;
      final String fileUrl = (uploadRes['fileUrl'] ?? uploadRes['FileUrl']) as String;

      // 2. Patch user avatar
      await ds.updateUserAvatar(_userUserId, mediaId);

      if (mounted) {
        Navigator.of(context).pop(); // Dismiss loading
        setState(() {
          _avatarUrl = fileUrl;
        });
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_user_avatar_url', fileUrl);

      scaffoldMessenger.showSnackBar(
        const SnackBar(
          content: Text('Đã cập nhật ảnh đại diện thành công!'),
          backgroundColor: Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 1),
        ),
      );
    } catch (e) {
      if (mounted) {
        try {
          Navigator.of(context).pop(); // Dismiss loading
        } catch (_) {}
      }
      scaffoldMessenger.showSnackBar(
        SnackBar(
          content: Text('Lỗi tải ảnh đại diện: $e'),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}
