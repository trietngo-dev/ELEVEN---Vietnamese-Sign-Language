import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';
import 'welcome_screen.dart';

class DeleteAccountScreen extends StatefulWidget {
  final int userId;

  const DeleteAccountScreen({super.key, required this.userId});

  @override
  State<DeleteAccountScreen> createState() => _DeleteAccountScreenState();
}

class _DeleteAccountScreenState extends State<DeleteAccountScreen> {
  bool _understandTerms = false;
  final _confirmController = TextEditingController();
  bool _canDelete = false;

  @override
  void initState() {
    super.initState();
    _confirmController.addListener(_validateInput);
  }

  @override
  void dispose() {
    _confirmController.removeListener(_validateInput);
    _confirmController.dispose();
    super.dispose();
  }

  void _validateInput() {
    final text = _confirmController.text.trim().toUpperCase();
    final isMatch = text == "CONFIRM";
    if (isMatch != _canDelete) {
      setState(() {
        _canDelete = isMatch;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: AppTheme.isWhiteBgNotifier,
      builder: (context, isWhiteBg, child) {
        final Color currentBgColor = isWhiteBg ? const Color(0xFFF8FDF8) : const Color(0xFF0A0F0D);
        final Color currentCardColor = isWhiteBg ? const Color(0xFFFFF5F5) : const Color(0xFF1F1212);
        final Color currentTextColor = isWhiteBg ? const Color(0xFF1E293B) : Colors.white;
        final Color currentTextMutedColor = isWhiteBg ? const Color(0xFF64748B) : const Color(0xFF94A3B8);
        final Color primaryColor = isWhiteBg ? const Color(0xFF10B981) : const Color(0xFF34D399);

        return Scaffold(
          backgroundColor: currentBgColor,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            leading: IconButton(
              icon: Icon(Icons.arrow_back_ios_new_rounded, color: currentTextColor),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: Text(
              "Xóa Tài Khoản",
              style: GoogleFonts.outfit(
                color: currentTextColor,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            centerTitle: true,
          ),
          body: BlocConsumer<AuthBloc, AuthState>(
            listener: (context, state) {
              if (state is AuthUnauthenticated) {
                // Hủy hết stack màn hình cũ và chuyển về WelcomeScreen
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (context) => const WelcomeScreen()),
                  (route) => false,
                );
              } else if (state is AuthFailure) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(state.error),
                    backgroundColor: Colors.redAccent,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            builder: (context, state) {
              final isLoading = state is AuthLoading;

              return SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Warning Icon header with glowing effect
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.redAccent.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.warning_amber_rounded,
                          color: Colors.redAccent,
                          size: 64,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    Text(
                      "Hành động này không thể hoàn tác!",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        color: Colors.redAccent,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      "Khi bạn xóa tài khoản, toàn bộ dữ liệu học tập và thông tin cá nhân của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống của chúng tôi.",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        color: currentTextMutedColor,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Warning card list of consequences
                    Card(
                      color: currentCardColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(
                          color: Colors.redAccent.withOpacity(0.2),
                          width: 1,
                        ),
                      ),
                      margin: EdgeInsets.zero,
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Các thông tin sẽ mất vĩnh viễn:",
                              style: GoogleFonts.outfit(
                                color: currentTextColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _buildWarningItem(
                              context,
                              "Tiến trình học tập và lịch sử kiểm tra AI",
                              currentTextColor,
                            ),
                            _buildWarningItem(
                              context,
                              "Số điểm XP tích lũy và danh hiệu (Badges)",
                              currentTextColor,
                            ),
                            _buildWarningItem(
                              context,
                              "Quyền lợi VIP và gói đăng ký dịch vụ hoạt động",
                              currentTextColor,
                            ),
                            _buildWarningItem(
                              context,
                              "Thông tin cá nhân, cài đặt và bài học đã lưu",
                              currentTextColor,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Checkbox confirmation
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: _understandTerms,
                          activeColor: Colors.redAccent,
                          onChanged: isLoading
                              ? null
                              : (val) {
                                  setState(() {
                                    _understandTerms = val ?? false;
                                  });
                                },
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: GestureDetector(
                              onTap: isLoading
                                  ? null
                                  : () {
                                      setState(() {
                                        _understandTerms = !_understandTerms;
                                      });
                                    },
                              child: Text(
                                "Tôi hiểu và đồng ý xóa toàn bộ dữ liệu cá nhân của tôi vĩnh viễn.",
                                style: GoogleFonts.outfit(
                                  color: currentTextColor,
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Text phrase confirmation
                    Text(
                      "Nhập chữ 'CONFIRM' bên dưới để xác nhận:",
                      style: GoogleFonts.outfit(
                        color: currentTextColor,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _confirmController,
                      enabled: !isLoading,
                      style: GoogleFonts.outfit(
                        color: currentTextColor,
                        fontWeight: FontWeight.bold,
                      ),
                      decoration: InputDecoration(
                        hintText: "Gõ CONFIRM để xác nhận",
                        hintStyle: GoogleFonts.outfit(
                          color: currentTextMutedColor.withOpacity(0.5),
                          fontWeight: FontWeight.normal,
                        ),
                        filled: true,
                        fillColor: isWhiteBg ? Colors.grey[100] : const Color(0xFF131A16),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: Colors.redAccent.withOpacity(0.2),
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Colors.redAccent,
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Actions
                    if (isLoading)
                      const Center(
                        child: CircularProgressIndicator(color: Colors.redAccent),
                      )
                    else
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          ElevatedButton(
                            onPressed: (_understandTerms && _canDelete)
                                ? () {
                                    context.read<AuthBloc>().add(
                                          AuthDeleteAccountRequested(widget.userId),
                                        );
                                  }
                                : null,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.redAccent,
                              disabledBackgroundColor: Colors.redAccent.withOpacity(0.3),
                              foregroundColor: Colors.white,
                              disabledForegroundColor: Colors.white.withOpacity(0.5),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              "Xóa Tài Khoản Vĩnh Viễn",
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: Text(
                              "Hủy & Giữ Lại Tài Khoản",
                              style: GoogleFonts.outfit(
                                color: primaryColor,
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildWarningItem(BuildContext context, String text, Color textColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.remove_circle_outline_rounded,
            color: Colors.redAccent,
            size: 16,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.outfit(
                color: textColor.withOpacity(0.8),
                fontSize: 13,
                height: 1.3,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
