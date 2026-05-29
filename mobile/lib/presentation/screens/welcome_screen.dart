import 'package:flutter/material.dart';
import 'login_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dark themed palette matching premium dark Figma design
    const Color darkBgColor = Color(0xFF0A0F0D);
    const Color darkCardColor = Color(0xFF131A16);
    const Color mintColor = Color(0xFF10B981); // Emerald mint
    const Color textMutedColor = Color(0xFF94A3B8);

    return Scaffold(
      backgroundColor: darkBgColor,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Navigation Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: mintColor.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.school_rounded,
                            color: mintColor,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'VSL LEARNER',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    OutlinedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                      child: const Text('Đăng nhập', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),

              // 2. Hero Header Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          height: 1.25,
                        ),
                        children: [
                          TextSpan(
                            text: 'Khám phá ngôn ngữ\nký hiệu ',
                            style: TextStyle(color: Colors.white),
                          ),
                          TextSpan(
                            text: 'VSL',
                            style: TextStyle(color: mintColor),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Trải nghiệm nền tảng học tập trực quan, hiện đại được thiết kế riêng để kết nối cộng đồng qua Ngôn ngữ Kí hiệu Việt Nam.',
                      style: TextStyle(
                        color: textMutedColor,
                        fontSize: 15,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const LoginScreen()),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: mintColor,
                              foregroundColor: Colors.white,
                              elevation: 4,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.play_arrow_rounded, size: 18),
                                SizedBox(width: 6),
                                Text('Bắt đầu ngay', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: const Text('Tìm hiểu thêm', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // 3. AI Interactive Promo Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                child: Container(
                  height: 220,
                  decoration: BoxDecoration(
                    color: darkCardColor,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                    image: const DecorationImage(
                      image: NetworkImage('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'),
                      fit: BoxFit.cover,
                      opacity: 0.35,
                    ),
                  ),
                  child: Stack(
                    children: [
                      // Target overlay simulator
                      Center(
                        child: Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            border: Border.all(color: mintColor, width: 2),
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                      // Target corner indicators
                      Positioned(
                        left: 20,
                        top: 20,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.circle, color: Colors.red, size: 8),
                              SizedBox(width: 6),
                              Text(
                                'ĐỘ CHÍNH XÁC AI 95%',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        right: 20,
                        bottom: 20,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: mintColor,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check_circle_outline_rounded,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 4. Value Props Section ("Học tập không giới hạn")
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Học tập không giới hạn',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Phương pháp tiếp cận trực quan tối đa hóa khả năng tiếp thu.',
                      style: TextStyle(color: textMutedColor, fontSize: 13),
                    ),
                    const SizedBox(height: 16),
                    
                    // Prop 1: Video sắc nét
                    _buildPropCard(
                      icon: Icons.hd_rounded,
                      title: 'Video sắc nét',
                      description: 'Hệ thống bài giảng video 4K tập trung hoàn toàn vào thao tác tay và khẩu hình.',
                      mintColor: mintColor,
                      cardColor: darkCardColor,
                    ),
                    const SizedBox(height: 12),
                    
                    // Prop 2: Thực hành tương tác
                    _buildPropCard(
                      icon: Icons.videocam_rounded,
                      title: 'Thực hành tương tác',
                      description: 'Luyện tập trực tiếp qua camera selfie với phản hồi phân tích AI ngay lập tức.',
                      mintColor: mintColor,
                      cardColor: darkCardColor,
                    ),
                    const SizedBox(height: 12),
                    
                    // Prop 3: Theo dõi tiến độ
                    _buildPropCard(
                      icon: Icons.track_changes_rounded,
                      title: 'Theo dõi tiến độ',
                      description: 'Hệ thống vòng tròn tiến độ trực quan giúp bạn nắm bắt mục tiêu mới mỗi ngày.',
                      mintColor: mintColor,
                      cardColor: darkCardColor,
                    ),
                  ],
                ),
              ),

              // 5. Featured Courses Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Khóa học nổi bật',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Bắt đầu hành trình giao tiếp của bạn ngay hôm nay.',
                      style: TextStyle(color: textMutedColor, fontSize: 13),
                    ),
                    const SizedBox(height: 16),

                    // Course item 1
                    _buildCourseFeaturedItem(
                      title: 'Nhập môn VSL & Bảng chữ cái',
                      level: 'Cơ bản',
                      lessonsCount: 10,
                      studentsCount: '2.4K học viên',
                      imgUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=400&auto=format&fit=crop',
                      cardColor: darkCardColor,
                      mintColor: mintColor,
                    ),
                    const SizedBox(height: 12),

                    // Course item 2
                    _buildCourseFeaturedItem(
                      title: 'Giao tiếp hằng ngày',
                      level: 'Trung cấp',
                      lessonsCount: 15,
                      studentsCount: '1.8K học viên',
                      imgUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop',
                      cardColor: darkCardColor,
                      mintColor: mintColor,
                    ),
                  ],
                ),
              ),

              // 6. Footer Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 48.0),
                child: Column(
                  children: [
                    Divider(color: Colors.white.withValues(alpha: 0.1)),
                    const SizedBox(height: 16),
                    const Text(
                      '© 2026 Silent Fluency. Nền tảng học đơn giản hóa VSL.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: textMutedColor,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPropCard({
    required IconData icon,
    required String title,
    required String description,
    required Color mintColor,
    required Color cardColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: mintColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: mintColor, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseFeaturedItem({
    required String title,
    required String level,
    required int lessonsCount,
    required String studentsCount,
    required String imgUrl,
    required Color cardColor,
    required Color mintColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
      ),
      child: Row(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              image: DecorationImage(
                image: NetworkImage(imgUrl),
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: mintColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    level,
                    style: TextStyle(
                      color: mintColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.book_rounded, color: Color(0xFF64748B), size: 12),
                    const SizedBox(width: 4),
                    Text(
                      '$lessonsCount bài học',
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                    ),
                    const SizedBox(width: 12),
                    const Icon(Icons.people_alt_rounded, color: Color(0xFF64748B), size: 12),
                    const SizedBox(width: 4),
                    Text(
                      studentsCount,
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
