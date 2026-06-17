import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';
import '../../data/datasources/profile_data_source.dart';
import '../bloc/auth_bloc.dart';

class SettingsScreen extends StatefulWidget {
  final int userId;
  const SettingsScreen({super.key, required this.userId});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _profileFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();

  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isLoading = true;
  bool _isSavingProfile = false;
  bool _isSavingPassword = false;
  Map<String, dynamic>? _userDetails;

  @override
  void initState() {
    super.initState();
    _loadUserDetails();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _loadUserDetails() async {
    try {
      final ds = context.read<ProfileDataSource>();
      final details = await ds.getUserDetails(widget.userId);
      setState(() {
        _userDetails = details;
        _nameController.text = (details['fullName'] ?? details['FullName'] ?? '').toString();
        _emailController.text = (details['email'] ?? details['Email'] ?? '').toString();
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Lỗi tải thông tin: ${e.toString().replaceAll('Exception: ', '')}"),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _updateProfile() async {
    if (!_profileFormKey.currentState!.validate() || _userDetails == null) return;

    setState(() {
      _isSavingProfile = true;
    });

    try {
      final ds = context.read<ProfileDataSource>();
      final updateData = {
        'roleId': _userDetails!['roleId'] ?? _userDetails!['RoleId'] ?? 2,
        'email': _userDetails!['email'] ?? _userDetails!['Email'] ?? '',
        'fullName': _nameController.text.trim(),
        'avatarMediaId': _userDetails!['avatarMediaId'] ?? _userDetails!['AvatarMediaId'],
        'status': _userDetails!['status'] ?? _userDetails!['Status'] ?? 1,
      };

      await ds.updateUserDetails(widget.userId, updateData);

      // Save to SharedPreferences so home screen picks it up
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_user_name', _nameController.text.trim());

      if (mounted) {
        setState(() {
          _isSavingProfile = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text("Cập nhật thông tin thành công!"),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSavingProfile = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Lỗi cập nhật: ${e.toString().replaceAll('Exception: ', '')}"),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  Future<void> _changePassword() async {
    if (!_passwordFormKey.currentState!.validate()) return;

    setState(() {
      _isSavingPassword = true;
    });

    try {
      final ds = context.read<ProfileDataSource>();
      await ds.changePassword(
        widget.userId,
        _currentPasswordController.text,
        _newPasswordController.text,
      );

      if (mounted) {
        setState(() {
          _isSavingPassword = false;
          _currentPasswordController.clear();
          _newPasswordController.clear();
          _confirmPasswordController.clear();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text("Đổi mật khẩu thành công!"),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSavingPassword = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Lỗi đổi mật khẩu: ${e.toString().replaceAll('Exception: ', '')}"),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    }
  }

  void _showThemeSelectionDialog(BuildContext context, bool isWhiteBg) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ValueListenableBuilder<bool>(
          valueListenable: AppTheme.isWhiteBgNotifier,
          builder: (context, isWhite, child) {
            return AlertDialog(
              backgroundColor: isWhite ? const Color(0xFFF8FDF8) : const Color(0xFF131A16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Text(
                "Màu nền ứng dụng",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isWhite ? const Color(0xFF1E293B) : Colors.white,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  RadioListTile<bool>(
                    title: Text("Nền Đen (Tối)", style: TextStyle(color: isWhite ? const Color(0xFF1E293B) : Colors.white)),
                    value: false,
                    groupValue: isWhite,
                    activeColor: const Color(0xFF10B981),
                    onChanged: (val) async {
                      if (val != null) {
                        AppTheme.isWhiteBgNotifier.value = val;
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setBool('is_white_bg', val);
                        if (context.mounted) Navigator.of(context).pop();
                      }
                    },
                  ),
                  RadioListTile<bool>(
                    title: Text("Nền Trắng (Sáng)", style: TextStyle(color: isWhite ? const Color(0xFF1E293B) : Colors.white)),
                    value: true,
                    groupValue: isWhite,
                    activeColor: const Color(0xFF10B981),
                    onChanged: (val) async {
                      if (val != null) {
                        AppTheme.isWhiteBgNotifier.value = val;
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setBool('is_white_bg', val);
                        if (context.mounted) Navigator.of(context).pop();
                      }
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showDeleteAccountDialog(BuildContext context, Color cardBg, Color textColor) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: cardBg,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
              const SizedBox(width: 10),
              Text(
                "Xác Nhận Xóa",
                style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
              ),
            ],
          ),
          content: Text(
            "Bạn có chắc chắn muốn xóa tài khoản? Hành động này sẽ làm mất toàn bộ tiến trình học tập, huy hiệu và đăng ký VIP của bạn. Hành động này không thể hoàn tác!",
            style: TextStyle(color: textColor.withValues(alpha: 0.7), fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text("Hủy", style: TextStyle(color: textColor.withValues(alpha: 0.4))),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Đóng Dialog
                context.read<AuthBloc>().add(AuthDeleteAccountRequested(widget.userId));
                // Pop Settings page as well
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text("Xóa Vĩnh Viễn", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    const Color mintColor = Color(0xFF10B981);

    return ValueListenableBuilder<bool>(
      valueListenable: AppTheme.isWhiteBgNotifier,
      builder: (context, isWhiteBg, child) {
        final Color currentBgColor = isWhiteBg ? const Color(0xFFF8FDF8) : const Color(0xFF0A0F0D);
        final Color currentCardColor = isWhiteBg ? const Color(0xFFE8F5E9) : const Color(0xFF131A16);
        final Color currentTextColor = isWhiteBg ? const Color(0xFF1E293B) : Colors.white;
        final Color currentTextMutedColor = isWhiteBg ? const Color(0xFF64748B) : const Color(0xFF94A3B8);
        final Color inputFillColor = isWhiteBg ? Colors.white : const Color(0xFF0F1412);
        final Color borderColor = isWhiteBg ? const Color(0xFFC2DFCA) : Colors.white.withValues(alpha: 0.05);

        return Scaffold(
          backgroundColor: currentBgColor,
          appBar: AppBar(
            backgroundColor: currentBgColor,
            elevation: 0,
            leading: IconButton(
              icon: Icon(Icons.arrow_back_ios_new_rounded, color: currentTextColor, size: 20),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: Text(
              "CÀI ĐẶT TÀI KHOẢN",
              style: GoogleFonts.quicksand(
                fontWeight: FontWeight.bold,
                color: currentTextColor,
                fontSize: 18,
              ),
            ),
            centerTitle: true,
          ),
          body: _isLoading
              ? const Center(child: CircularProgressIndicator(color: mintColor))
              : SafeArea(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Section 1: Màu nền ứng dụng
                        _buildSectionHeader("Giao diện & Chủ đề", currentTextColor),
                        Container(
                          decoration: BoxDecoration(
                            color: currentCardColor,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: borderColor),
                          ),
                          child: ListTile(
                            leading: const Icon(Icons.color_lens_rounded, color: mintColor),
                            title: Text(
                              "Màu nền ứng dụng",
                              style: TextStyle(color: currentTextColor, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            subtitle: Text(
                              isWhiteBg ? "Nền Trắng (Sáng)" : "Nền Đen (Tối)",
                              style: TextStyle(color: currentTextMutedColor, fontSize: 12),
                            ),
                            trailing: Icon(Icons.chevron_right_rounded, color: currentTextMutedColor),
                            onTap: () => _showThemeSelectionDialog(context, isWhiteBg),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Section 2: Thay đổi thông tin cá nhân
                        _buildSectionHeader("Thông tin cá nhân", currentTextColor),
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: currentCardColor,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: borderColor),
                          ),
                          child: Form(
                            key: _profileFormKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Name Field
                                Text(
                                  "Họ và tên",
                                  style: TextStyle(color: currentTextColor, fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _nameController,
                                  style: TextStyle(color: currentTextColor, fontSize: 14),
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: inputFillColor,
                                    hintText: "Nhập họ và tên",
                                    hintStyle: TextStyle(color: currentTextMutedColor),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: borderColor),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: mintColor),
                                    ),
                                    errorBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: Colors.redAccent),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return "Họ và tên không được để trống";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),

                                // Email Field (Read-only)
                                Text(
                                  "Email (Không thể thay đổi)",
                                  style: TextStyle(color: currentTextMutedColor, fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _emailController,
                                  readOnly: true,
                                  style: TextStyle(color: currentTextMutedColor, fontSize: 14),
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: inputFillColor.withValues(alpha: 0.5),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: borderColor.withValues(alpha: 0.5)),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 20),

                                // Save Button
                                _isSavingProfile
                                    ? const Center(child: CircularProgressIndicator(color: mintColor))
                                    : ElevatedButton(
                                        onPressed: _updateProfile,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: mintColor,
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          padding: const EdgeInsets.symmetric(vertical: 12),
                                        ),
                                        child: const Text(
                                          "Lưu thông tin",
                                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                        ),
                                      ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Section 3: Đổi mật khẩu
                        _buildSectionHeader("Đổi mật khẩu", currentTextColor),
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: currentCardColor,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: borderColor),
                          ),
                          child: Form(
                            key: _passwordFormKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Current Password
                                Text(
                                  "Mật khẩu hiện tại",
                                  style: TextStyle(color: currentTextColor, fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _currentPasswordController,
                                  obscureText: true,
                                  style: TextStyle(color: currentTextColor, fontSize: 14),
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: inputFillColor,
                                    hintText: "••••••••",
                                    hintStyle: TextStyle(color: currentTextMutedColor),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: borderColor),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: mintColor),
                                    ),
                                    errorBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: Colors.redAccent),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return "Vui lòng nhập mật khẩu hiện tại";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),

                                // New Password
                                Text(
                                  "Mật khẩu mới",
                                  style: TextStyle(color: currentTextColor, fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _newPasswordController,
                                  obscureText: true,
                                  style: TextStyle(color: currentTextColor, fontSize: 14),
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: inputFillColor,
                                    hintText: "Nhập mật khẩu mới (tối thiểu 6 ký tự)",
                                    hintStyle: TextStyle(color: currentTextMutedColor),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: borderColor),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: mintColor),
                                    ),
                                    errorBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: Colors.redAccent),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.length < 6) {
                                      return "Mật khẩu mới phải từ 6 ký tự";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),

                                // Confirm New Password
                                Text(
                                  "Xác nhận mật khẩu mới",
                                  style: TextStyle(color: currentTextColor, fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _confirmPasswordController,
                                  obscureText: true,
                                  style: TextStyle(color: currentTextColor, fontSize: 14),
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: inputFillColor,
                                    hintText: "Xác nhận mật khẩu mới",
                                    hintStyle: TextStyle(color: currentTextMutedColor),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: borderColor),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: mintColor),
                                    ),
                                    errorBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(color: Colors.redAccent),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value != _newPasswordController.text) {
                                      return "Xác nhận mật khẩu mới không khớp";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 20),

                                // Save Button
                                _isSavingPassword
                                    ? const Center(child: CircularProgressIndicator(color: mintColor))
                                    : ElevatedButton(
                                        onPressed: _changePassword,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: mintColor,
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                          padding: const EdgeInsets.symmetric(vertical: 12),
                                        ),
                                        child: const Text(
                                          "Đổi mật khẩu",
                                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                        ),
                                      ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Section 4: Vùng nguy hiểm (Xóa tài khoản)
                        _buildSectionHeader("Vùng nguy hiểm", Colors.redAccent),
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isWhiteBg ? const Color(0xFFFDF2F2) : const Color(0xFF241414),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.redAccent.withValues(alpha: 0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                "Xóa tài khoản vĩnh viễn",
                                style: TextStyle(color: currentTextColor, fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                "Thao tác này sẽ xóa toàn bộ tiến trình học tập, XP, danh hiệu và lịch sử đăng ký VIP của bạn. Không thể khôi phục sau khi xóa.",
                                style: TextStyle(color: currentTextMutedColor, fontSize: 12),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: () => _showDeleteAccountDialog(context, currentCardColor, currentTextColor),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.redAccent,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                                icon: const Icon(Icons.delete_forever_rounded, size: 20),
                                label: const Text(
                                  "Yêu cầu xóa tài khoản",
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
        );
      },
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 10),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }
}
