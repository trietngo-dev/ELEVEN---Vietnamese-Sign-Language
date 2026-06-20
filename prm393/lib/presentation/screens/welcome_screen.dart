import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import 'login_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor.withOpacity(0.8),
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Row(
          children: [
            const Icon(
              Icons.sign_language_rounded,
              color: AppTheme.primaryColor,
              size: 28,
            ),
            const SizedBox(width: 8),
            Text(
              'VSL LEARNER',
              style: textTheme.headlineSmall?.copyWith(
                color: AppTheme.primaryColor,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: BorderSide(color: Colors.white.withOpacity(0.1)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
              child: Text(
                'Đăng nhập',
                style: textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
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
          // Background Color and Radial Ambient Glows
          Container(
            width: double.infinity,
            height: double.infinity,
            color: AppTheme.backgroundColor,
          ),
          Positioned(
            top: -size.height * 0.1,
            left: -size.width * 0.2,
            child: Container(
              width: size.width * 0.7,
              height: size.width * 0.7,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryColor.withOpacity(0.06),
              ),
            ),
          ),
          Positioned(
            bottom: size.height * 0.2,
            right: -size.width * 0.3,
            child: Container(
              width: size.width * 0.8,
              height: size.width * 0.8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.secondaryColor.withOpacity(0.05),
              ),
            ),
          ),

          // Scrollable Content
          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Hero Headline
                    Text(
                      'Khám phá ngôn ngữ',
                      style: textTheme.headlineMedium?.copyWith(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                      ).createShader(bounds),
                      child: Text(
                        'ký hiệu VSL',
                        style: textTheme.headlineMedium?.copyWith(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          height: 1.2,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Hero Subtitle
                    Text(
                      'Trải nghiệm nền tảng học tập trực quan, hiện đại được thiết kế riêng để kết nối cộng đồng qua Ngôn ngữ Ký hiệu Việt Nam.',
                      style: textTheme.bodyMedium?.copyWith(
                        color: AppTheme.onSurfaceVariant,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Action Buttons Row
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12.0),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryColor.withOpacity(0.2),
                                  blurRadius: 15,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryColor,
                                foregroundColor: AppTheme.onPrimaryContainer,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12.0),
                                ),
                                elevation: 0,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.play_arrow_rounded, size: 20),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Bắt đầu ngay',
                                    style: textTheme.labelLarge?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.onPrimaryContainer,
                                      fontSize: 15,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Vui lòng đăng nhập để bắt đầu học.'),
                                  backgroundColor: AppTheme.surfaceContainer,
                                ),
                              );
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: BorderSide(color: Colors.white.withOpacity(0.1)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: Text(
                              'Tìm hiểu thêm',
                              style: textTheme.labelLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 36),

                    // Hero Mock Image Glass Card
                    AppTheme.glassPanel(
                      borderRadius: 24.0,
                      padding: EdgeInsets.zero,
                      child: AspectRatio(
                        aspectRatio: 4 / 3,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            // Backdrop Image
                            Image.network(
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuDfw_w3gOPEJbQmubI_FOT1iDcAKsjNPYuGXCeKCnWJ0jzgkkftK-X4kXlbk9D2Xy-xh12h9YepQyvSOkv-H887ZTwcTgsJvTAs9YrE3Q4uaeCSSD99t6e6kYrouXlcnVf3hjpM3yFLlS2hDYTxCa3_TLxIDWDsoDTuQCsVeQ-8_AfErHcHf264Exhos4hUT81YFSKbooCQzeXa4O105n4qd4bUPH0gpDUXEaLaS6TFVtBFQesZ0Vs-Ng8jGrxEZZhwzzXvuUh3wWk',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: Colors.black45,
                                  child: const Center(
                                    child: Icon(Icons.gesture_rounded, size: 64, color: AppTheme.primaryColor),
                                  ),
                                );
                              },
                            ),
                            // Dark Glass Overlay
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.black.withOpacity(0.5),
                                    AppTheme.surfaceContainer.withOpacity(0.2),
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                            ),
                            // Floating AI Accuracy Card
                            Positioned(
                              bottom: 16,
                              left: 16,
                              right: 16,
                              child: AppTheme.glassPanel(
                                borderRadius: 12.0,
                                padding: const EdgeInsets.all(12),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppTheme.primaryColor.withOpacity(0.2),
                                      ),
                                      child: const Icon(
                                        Icons.check_circle_rounded,
                                        color: AppTheme.primaryColor,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            'Độ chính xác AI',
                                            style: textTheme.labelLarge?.copyWith(
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            'Phân tích cử chỉ tay trực quan',
                                            style: textTheme.bodyMedium?.copyWith(
                                              fontSize: 11,
                                              color: AppTheme.onSurfaceVariant,
                                            ),
                                          ),
                                        ],
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
                    const SizedBox(height: 56),

                    // Features Section
                    Column(
                      children: [
                        Text(
                          'Học tập không giới hạn',
                          style: textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                            color: Colors.white,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Phương pháp tiếp cận trực quan tối đa',
                          style: textTheme.bodyMedium?.copyWith(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 13,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),

                        // Feature Cards
                        _buildFeatureCard(
                          icon: Icons.video_library_rounded,
                          iconColor: AppTheme.secondaryColor,
                          title: 'Video sắc nét',
                          description:
                              'Hệ thống bài giảng video 4K tập trung hoàn toàn vào thao tác tay và khẩu hình.',
                          textTheme: textTheme,
                        ),
                        const SizedBox(height: 16),
                        _buildFeatureCard(
                          icon: Icons.sports_esports_rounded,
                          iconColor: AppTheme.primaryColor,
                          title: 'Thực hành tương tác',
                          description:
                              'Luyện tập trực tiếp qua camera với phản hồi AI ngay lập tức.',
                          textTheme: textTheme,
                        ),
                        const SizedBox(height: 16),
                        _buildFeatureCard(
                          icon: Icons.track_changes_rounded,
                          iconColor: const Color(0xFFD0BCFF), // Tertiary Purple
                          title: 'Theo dõi tiến độ',
                          description:
                              'Hệ thống vòng tròn tiến độ trực quan giúp bạn nắm bắt mục tiêu mỗi ngày.',
                          textTheme: textTheme,
                        ),
                      ],
                    ),
                    const SizedBox(height: 56),

                    // Courses Section
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Khóa học nổi bật',
                          style: textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Bắt đầu hành trình giao tiếp của bạn',
                          style: textTheme.bodyMedium?.copyWith(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Course Card 1
                        _buildCourseCard(
                          image:
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuCdrhjXYjiCyU8kSjI_LKphm-XmF-wSUdxkL5shWnyNidwECAzFz4X0Q2xwFt_NQj2pO2_2DkskdsdOisBj3WBe9E3c7VNsJJE1NliKglRJ2w0WPH_xFhmEyQKqTCyJX-1qxqUSPYWFU_JDLhAR18CBoqa0xBejRWC8pEZspySgiMlrLhRL2BOrZ_BdHJtg8purnWG4gMNgZxcyTgyEh1dzKrnTq73J-zC8K4E-Z1MkHD5EuGc_P4-zOPGx7bIDcnPTjHk-fhHOYlM',
                          level: 'Cơ bản',
                          title: 'Nhập môn VSL & Bảng chữ cái',
                          description:
                              'Làm quen với bảng chữ cái tiếng Việt bằng tay và các quy tắc giao tiếp cơ bản.',
                          lessons: 12,
                          students: '2.4k',
                          textTheme: textTheme,
                        ),
                        const SizedBox(height: 16),

                        // Course Card 2
                        _buildCourseCard(
                          image:
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuDmV6jrofWQEwwM88ie1Aod8k1XsjI4y1enPbDC9oi4tWokCpSA9MnKslr-NwXDnPH_9AaZvv14iLFlxjprmD3hFkWVmu92M7FtXpPM7t9d9tyW5rBgbxRaHRb0uZf6AH21HxraK3OQIWs-Gc3wYvYnFLw_D3AMcVr7gj1ig9h4Vf7lHOzHXl61VTacdjaEHvkrG5NEevL7_wHGnUJGzDXiwpIeQbiRtUa6YceBhrIxoEeaW-64jyLp0arC62WB7X6HunHeENKYSuA',
                          level: 'Trung cấp',
                          title: 'Giao tiếp hàng ngày',
                          description:
                              'Các mẫu câu thường dùng trong sinh hoạt, mua sắm và hỏi đường.',
                          lessons: 18,
                          students: '1.8k',
                          textTheme: textTheme,
                        ),
                        const SizedBox(height: 16),

                        // Course Card 3
                        _buildCourseCard(
                          image:
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuAYDe4KYQY1cDNDJUMKEnuidj0WNsIdZgI0T6AXl_XhOUoqAz1Cuv8v4wRNYdwbb38wKui6JlNtTQ0tM4FfePXxAjwfbTYUkZQbC9Qo3KeRG2Fugv4R3aZ5MTonX0D4avx6NUVuwTWo7X7W23uy0zS-zRhC0WcrkjuoSkAlKCowIul9XeCWkQios-HGJBvCaWNeAYpkXeQ1EsuFoL2al7URospEdueosssNnBFfZIARI2xp3v_opAt1Pz9zksx99wKnSptehgjIdAw',
                          level: 'Chuyên đề',
                          title: 'Từ vựng Gia đình & Cảm xúc',
                          description:
                              'Thể hiện tình cảm và mô tả các mối quan hệ gia đình chi tiết.',
                          lessons: 10,
                          students: '950',
                          textTheme: textTheme,
                        ),
                      ],
                    ),
                    const SizedBox(height: 48),

                    // Footer
                    Divider(color: Colors.white.withOpacity(0.05)),
                    const SizedBox(height: 16),
                    Text(
                      '© 2024 Silent Fluency. Nền tảng giáo dục VSL.',
                      style: textTheme.bodyMedium?.copyWith(
                        color: AppTheme.onSurfaceVariant.withOpacity(0.6),
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
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

  Widget _buildFeatureCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
    required TextTheme textTheme,
  }) {
    return AppTheme.glassPanel(
      borderRadius: 16.0,
      padding: const EdgeInsets.all(20.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: iconColor.withOpacity(0.15),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  description,
                  style: textTheme.bodyMedium?.copyWith(
                    color: AppTheme.onSurfaceVariant,
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

  Widget _buildCourseCard({
    required String image,
    required String level,
    required String title,
    required String description,
    required int lessons,
    required String students,
    required TextTheme textTheme,
  }) {
    return AppTheme.glassPanel(
      borderRadius: 20.0,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Image with level tag
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.network(
                  image,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: AppTheme.surfaceContainerHighest,
                      child: const Icon(Icons.menu_book_rounded, size: 48, color: AppTheme.onSurfaceVariant),
                    );
                  },
                ),
                Container(
                  color: Colors.black.withOpacity(0.35),
                ),
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withOpacity(0.15)),
                    ),
                    child: Text(
                      level,
                      style: textTheme.labelLarge?.copyWith(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Description Content
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: textTheme.bodyMedium?.copyWith(
                    color: AppTheme.onSurfaceVariant,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.menu_book_rounded, color: AppTheme.onSurfaceVariant, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '$lessons bài',
                          style: textTheme.bodyMedium?.copyWith(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        const Icon(Icons.people_alt_rounded, color: AppTheme.onSurfaceVariant, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '$students học viên',
                          style: textTheme.bodyMedium?.copyWith(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 12,
                          ),
                        ),
                      ],
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
