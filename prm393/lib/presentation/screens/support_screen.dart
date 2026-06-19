import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _messageController = TextEditingController();
  String _selectedTopic = 'Vấn đề về tài khoản';
  bool _isSubmitting = false;

  final List<String> _topics = [
    'Vấn đề về tài khoản',
    'Lỗi ứng dụng',
    'Góp ý tính năng',
    'Khác',
  ];

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _onSubmitTicket() {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() {
        _isSubmitting = true;
      });

      // Simulate API submit call
      Future.delayed(const Duration(seconds: 1500 ~/ 1000), () {
        if (!mounted) return;
        setState(() {
          _isSubmitting = false;
        });
        _messageController.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.white),
                SizedBox(width: 8),
                Text('Yêu cầu hỗ trợ đã được gửi thành công!'),
              ],
            ),
            backgroundColor: AppTheme.primaryContainer,
          ),
        );
      });
    }
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
          'Trợ giúp & Hỗ trợ',
          style: textTheme.headlineSmall?.copyWith(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
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
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Search Bar
                    TextField(
                      decoration: InputDecoration(
                        hintText: 'Tìm kiếm câu hỏi thường gặp...',
                        prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.onSurfaceVariant),
                        filled: true,
                        fillColor: AppTheme.surfaceContainer.withOpacity(0.4),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Popular Categories Header
                    Text(
                      'DANH MỤC PHỔ BIẾN',
                      style: textTheme.labelLarge?.copyWith(
                        fontSize: 11,
                        color: AppTheme.onSurfaceVariant,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Grid Categories
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.5,
                      children: [
                        _buildCategoryGridItem(Icons.rocket_launch_rounded, 'Bắt đầu'),
                        _buildCategoryGridItem(Icons.account_circle_rounded, 'Tài khoản'),
                        _buildCategoryGridItem(Icons.payments_rounded, 'Thanh toán'),
                        _buildCategoryGridItem(Icons.build_rounded, 'Lỗi kỹ thuật'),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Request Form Section
                    AppTheme.glassPanel(
                      padding: const EdgeInsets.all(20.0),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryColor.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.send_rounded, color: AppTheme.primaryColor, size: 18),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  'Gửi yêu cầu hỗ trợ',
                                  style: textTheme.headlineSmall?.copyWith(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),

                            // Dropdown Topic Selector
                            const Text(
                              'Chủ đề',
                              style: TextStyle(color: AppTheme.onSurfaceVariant, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: AppTheme.surfaceContainer.withOpacity(0.6),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.white.withOpacity(0.1)),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _selectedTopic,
                                  dropdownColor: AppTheme.surfaceContainer,
                                  isExpanded: true,
                                  icon: const Icon(Icons.expand_more_rounded, color: AppTheme.onSurfaceVariant),
                                  items: _topics.map((String topic) {
                                    return DropdownMenuItem<String>(
                                      value: topic,
                                      child: Text(topic, style: const TextStyle(color: Colors.white, fontSize: 14)),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) {
                                      setState(() {
                                        _selectedTopic = val;
                                      });
                                    }
                                  },
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Details input field
                            const Text(
                              'Nội dung chi tiết',
                              style: TextStyle(color: AppTheme.onSurfaceVariant, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _messageController,
                              maxLines: 4,
                              validator: (val) => val == null || val.trim().isEmpty ? 'Vui lòng nhập nội dung chi tiết' : null,
                              decoration: const InputDecoration(
                                hintText: 'Mô tả chi tiết vấn đề bạn đang gặp phải...',
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Submit Button
                            ElevatedButton(
                              onPressed: _isSubmitting ? null : _onSubmitTicket,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primaryColor,
                                foregroundColor: AppTheme.onPrimaryContainer,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12.0),
                                ),
                              ),
                              child: _isSubmitting
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation(AppTheme.onPrimaryContainer),
                                      ),
                                    )
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Gửi yêu cầu',
                                          style: textTheme.labelLarge?.copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.onPrimaryContainer,
                                            fontSize: 15,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        const Icon(Icons.send_rounded, size: 14),
                                      ],
                                    ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Contact Info
                    AppTheme.glassPanel(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Thông tin liên hệ',
                            style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppTheme.secondaryColor.withOpacity(0.15),
                                ),
                                child: const Icon(Icons.mail_rounded, color: AppTheme.secondaryColor, size: 20),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Email hỗ trợ',
                                      style: TextStyle(color: AppTheme.onSurfaceVariant, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      'support@silentfluency.com',
                                      style: textTheme.bodyMedium?.copyWith(
                                        color: AppTheme.primaryColor,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Divider(color: Colors.white.withOpacity(0.05)),
                          const SizedBox(height: 8),
                          _buildExtraInfoRow('Điều khoản sử dụng'),
                          const SizedBox(height: 8),
                          _buildExtraInfoRow('Chính sách bảo mật'),
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

  Widget _buildCategoryGridItem(IconData icon, String title) {
    return AppTheme.glassPanel(
      padding: const EdgeInsets.all(12.0),
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đang tải danh mục FAQ: $title'),
              backgroundColor: AppTheme.surfaceContainer,
            ),
          );
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppTheme.primaryColor, size: 26),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExtraInfoRow(String title) {
    return InkWell(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đang hiển thị $title...'),
            backgroundColor: AppTheme.surfaceContainer,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.description_outlined, color: AppTheme.onSurfaceVariant, size: 18),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
                ),
              ],
            ),
            const Icon(Icons.chevron_right_rounded, color: AppTheme.onSurfaceVariant, size: 16),
          ],
        ),
      ),
    );
  }
}
