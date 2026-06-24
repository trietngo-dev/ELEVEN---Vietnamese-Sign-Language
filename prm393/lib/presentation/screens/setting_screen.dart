import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_theme.dart';
import '../../domain/usecases/auth/get_user_profile_phone_usecase.dart';
import '../../domain/usecases/auth/update_user_info_usecase.dart';
import '../../domain/usecases/auth/update_user_profile_phone_usecase.dart';
import '../../domain/usecases/auth/change_password_usecase.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import 'welcome_screen.dart';

class SettingScreen extends StatefulWidget {
  final int userId;
  final String initialName;
  final String initialEmail;
  final String initialPhone;

  const SettingScreen({
    super.key,
    required this.userId,
    required this.initialName,
    required this.initialEmail,
    required this.initialPhone,
  });

  @override
  State<SettingScreen> createState() => _SettingScreenState();
}

class _SettingScreenState extends State<SettingScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  bool _notifyLessons = true;
  bool _notifyUpdates = true;
  bool _twoFactorEnabled = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
    _emailController = TextEditingController(text: widget.initialEmail);
    _phoneController = TextEditingController(text: widget.initialPhone);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadRealPhone());
  }

  void _loadRealPhone() async {
    if (!mounted) return;
    try {
      final getUserProfilePhoneUseCase = context
          .read<GetUserProfilePhoneUseCase>();
      final realPhone = await getUserProfilePhoneUseCase(widget.userId);
      if (realPhone != null && mounted) {
        setState(() {
          _phoneController.text = realPhone;
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _onSavePressed() async {
    if (_formKey.currentState?.validate() ?? false) {
      final messenger = ScaffoldMessenger.of(context);
      final authBloc = context.read<AuthBloc>();

      // Show saving spinner snackbar
      messenger.showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation(Colors.white),
                ),
              ),
              SizedBox(width: 12),
              Text('Đang lưu thay đổi...'),
            ],
          ),
          backgroundColor: AppTheme.surfaceContainer,
          duration: Duration(minutes: 5), // Keep open during async execution
        ),
      );

      try {
        final updateUserInfoUseCase = context.read<UpdateUserInfoUseCase>();
        final updateUserProfilePhoneUseCase = context
            .read<UpdateUserProfilePhoneUseCase>();

        await Future.wait([
          updateUserInfoUseCase(widget.userId, _nameController.text.trim()),
          updateUserProfilePhoneUseCase(
            widget.userId,
            _phoneController.text.trim(),
          ),
        ]);

        if (!mounted) return;
        messenger.hideCurrentSnackBar();
        messenger.showSnackBar(
          const SnackBar(
            content: Text('Đã cập nhật thông tin cá nhân thành công!'),
            backgroundColor: AppTheme.primaryContainer,
          ),
        );

        // Refresh AuthBloc with updated cached info
        authBloc.add(AuthCheckRequested());

        Navigator.pop(context);
      } catch (e) {
        if (!mounted) return;
        messenger.hideCurrentSnackBar();
        messenger.showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
            backgroundColor: const Color(0xFFE46C6C),
          ),
        );
      }
    }
  }

  void _onChangePasswordPressed(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: AppTheme.surfaceContainer,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: Colors.white.withOpacity(0.05)),
              ),
              title: const Text(
                'Thay đổi mật khẩu',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              content: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: currentPasswordController,
                        obscureText: obscureCurrent,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                        decoration: InputDecoration(
                          labelText: 'Mật khẩu hiện tại',
                          labelStyle: const TextStyle(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 12,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              obscureCurrent
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: AppTheme.onSurfaceVariant,
                              size: 18,
                            ),
                            onPressed: () {
                              setDialogState(() {
                                obscureCurrent = !obscureCurrent;
                              });
                            },
                          ),
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return 'Vui lòng nhập mật khẩu hiện tại';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: newPasswordController,
                        obscureText: obscureNew,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                        decoration: InputDecoration(
                          labelText: 'Mật khẩu mới',
                          labelStyle: const TextStyle(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 12,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              obscureNew
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: AppTheme.onSurfaceVariant,
                              size: 18,
                            ),
                            onPressed: () {
                              setDialogState(() {
                                obscureNew = !obscureNew;
                              });
                            },
                          ),
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return 'Vui lòng nhập mật khẩu mới';
                          }
                          if (val.length < 6) {
                            return 'Mật khẩu mới phải dài ít nhất 6 ký tự';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: confirmPasswordController,
                        obscureText: obscureConfirm,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                        decoration: InputDecoration(
                          labelText: 'Xác nhận mật khẩu mới',
                          labelStyle: const TextStyle(
                            color: AppTheme.onSurfaceVariant,
                            fontSize: 12,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              obscureConfirm
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: AppTheme.onSurfaceVariant,
                              size: 18,
                            ),
                            onPressed: () {
                              setDialogState(() {
                                obscureConfirm = !obscureConfirm;
                              });
                            },
                          ),
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return 'Vui lòng xác nhận mật khẩu mới';
                          }
                          if (val != newPasswordController.text) {
                            return 'Mật khẩu xác nhận không trùng khớp';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    currentPasswordController.dispose();
                    newPasswordController.dispose();
                    confirmPasswordController.dispose();
                    Navigator.pop(dialogContext);
                  },
                  child: const Text(
                    'Hủy',
                    style: TextStyle(color: AppTheme.onSurfaceVariant),
                  ),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (formKey.currentState?.validate() ?? false) {
                      final messenger = ScaffoldMessenger.of(context);
                      final changePasswordUseCase = context
                          .read<ChangePasswordUseCase>();

                      Navigator.pop(dialogContext);

                      messenger.showSnackBar(
                        const SnackBar(
                          content: Row(
                            children: [
                              SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation(
                                    Colors.white,
                                  ),
                                ),
                              ),
                              SizedBox(width: 12),
                              Text('Đang đổi mật khẩu...'),
                            ],
                          ),
                          backgroundColor: AppTheme.surfaceContainer,
                          duration: Duration(minutes: 5),
                        ),
                      );

                      try {
                        await changePasswordUseCase(
                          widget.userId,
                          currentPasswordController.text,
                          newPasswordController.text,
                        );

                        if (!mounted) return;
                        messenger.hideCurrentSnackBar();
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('Đổi mật khẩu thành công!'),
                            backgroundColor: AppTheme.primaryContainer,
                          ),
                        );
                      } catch (e) {
                        if (!mounted) return;
                        messenger.hideCurrentSnackBar();
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('Lỗi: ${e.toString()}'),
                            backgroundColor: const Color(0xFFE46C6C),
                          ),
                        );
                      } finally {
                        currentPasswordController.dispose();
                        newPasswordController.dispose();
                        confirmPasswordController.dispose();
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: AppTheme.onPrimaryContainer,
                  ),
                  child: const Text('Thay đổi'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _onDeleteAccount(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainer,
        title: const Text(
          'Xóa tài khoản',
          style: TextStyle(
            color: Color(0xFFE46C6C),
            fontWeight: FontWeight.bold,
          ),
        ),
        content: const Text(
          'Hành động này không thể hoàn tác. Mọi tiến trình học tập, thống kê của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Hủy', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              context.read<AuthBloc>().add(
                AuthDeleteAccountRequested(userId: widget.userId),
              );
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE46C6C),
              foregroundColor: Colors.white,
            ),
            child: const Text('Xóa vĩnh viễn'),
          ),
        ],
      ),
    );
  }

  void _showAboutAppDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: AppTheme.surfaceContainer,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Về VSL Learner',
          style: TextStyle(
            color: AppTheme.primaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Center(
              child: CircleAvatar(
                radius: 32,
                backgroundImage: AssetImage('assets/logo.jpg'),
              ),
            ),
            const SizedBox(height: 16),
            const Center(
              child: Text(
                'VSL Learner - Phiên bản 1.0.0',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Divider(color: Colors.white12),
            const SizedBox(height: 8),
            const Text(
              'Ứng dụng học Ngôn ngữ Ký hiệu Việt Nam tích hợp AI hỗ trợ nhận diện cử chỉ tay thông qua camera selfie.',
              style: TextStyle(color: AppTheme.onSurfaceVariant, fontSize: 13),
            ),
            const SizedBox(height: 12),
            const Text(
              'Nhóm phát triển: Eleven',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Môn học: PRM393 - Mobile Application Development',
              style: TextStyle(color: Colors.white60, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text(
              'Đóng',
              style: TextStyle(color: AppTheme.primaryColor),
            ),
          ),
        ],
      ),
    );
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
          icon: const Icon(
            Icons.arrow_back_rounded,
            color: AppTheme.primaryColor,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Cài đặt tài khoản',
          style: textTheme.headlineSmall?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.primaryColor.withOpacity(0.2),
              child: const Icon(
                Icons.person_rounded,
                color: AppTheme.primaryColor,
                size: 18,
              ),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: Colors.white.withOpacity(0.05), height: 1.0),
        ),
      ),
      body: Stack(
        children: [
          Container(color: AppTheme.backgroundColor),
          SafeArea(
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16.0,
                    vertical: 20.0,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Section: Thông tin cá nhân
                      _buildSectionHeader(
                        Icons.person_outline_rounded,
                        'Thông tin cá nhân',
                        textTheme,
                      ),
                      const SizedBox(height: 12),
                      AppTheme.glassPanel(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          children: [
                            _buildTextField(
                              controller: _nameController,
                              label: 'Họ và tên',
                              hint: 'Nhập họ và tên',
                              validator: (val) =>
                                  val == null || val.trim().isEmpty
                                  ? 'Vui lòng nhập họ tên'
                                  : null,
                            ),
                            const SizedBox(height: 16),
                            _buildTextField(
                              controller: _emailController,
                              label: 'Email (Không thể chỉnh sửa)',
                              hint: 'example@email.com',
                              keyboardType: TextInputType.emailAddress,
                              enabled: false,
                            ),
                            const SizedBox(height: 16),
                            _buildTextField(
                              controller: _phoneController,
                              label: 'Số điện thoại',
                              hint: 'Nhập số điện thoại',
                              keyboardType: TextInputType.phone,
                              validator: (val) =>
                                  val == null || val.trim().isEmpty
                                  ? 'Vui lòng nhập số điện thoại'
                                  : null,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Section: Bảo mật
                      _buildSectionHeader(
                        Icons.shield_outlined,
                        'Bảo mật',
                        textTheme,
                      ),
                      const SizedBox(height: 12),
                      AppTheme.glassPanel(
                        padding: EdgeInsets.zero,
                        child: Column(
                          children: [
                            ListTile(
                              leading: const Icon(
                                Icons.lock_reset_rounded,
                                color: AppTheme.onSurfaceVariant,
                                size: 20,
                              ),
                              title: const Text(
                                'Đổi mật khẩu',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              trailing: const Icon(
                                Icons.chevron_right_rounded,
                                color: AppTheme.onSurfaceVariant,
                                size: 20,
                              ),
                              onTap: () => _onChangePasswordPressed(context),
                            ),
                            Divider(
                              color: Colors.white.withOpacity(0.05),
                              height: 1,
                            ),
                            SwitchListTile(
                              secondary: const Icon(
                                Icons.verified_user_rounded,
                                color: AppTheme.onSurfaceVariant,
                                size: 20,
                              ),
                              title: const Text(
                                'Xác thực 2 yếu tố',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              subtitle: Text(
                                _twoFactorEnabled
                                    ? 'Đang kích hoạt'
                                    : 'Chưa kích hoạt',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.onSurfaceVariant,
                                ),
                              ),
                              value: _twoFactorEnabled,
                              activeColor: AppTheme.primaryColor,
                              activeTrackColor: AppTheme.primaryContainer
                                  .withOpacity(0.5),
                              inactiveThumbColor: AppTheme.onSurfaceVariant,
                              inactiveTrackColor: Colors.white10,
                              onChanged: (val) {
                                setState(() {
                                  _twoFactorEnabled = val;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Section: Thông báo
                      _buildSectionHeader(
                        Icons.notifications_none_rounded,
                        'Thông báo',
                        textTheme,
                      ),
                      const SizedBox(height: 12),
                      AppTheme.glassPanel(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          children: [
                            _buildToggleRow(
                              title: 'Thông báo bài học',
                              subtitle: 'Nhắc nhở học tập hàng ngày',
                              value: _notifyLessons,
                              onChanged: (val) {
                                setState(() {
                                  _notifyLessons = val;
                                });
                              },
                            ),
                            const SizedBox(height: 20),
                            _buildToggleRow(
                              title: 'Cập nhật ứng dụng',
                              subtitle: 'Thông tin về tính năng mới',
                              value: _notifyUpdates,
                              onChanged: (val) {
                                setState(() {
                                  _notifyUpdates = val;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Section: Về ứng dụng
                      _buildSectionHeader(
                        Icons.info_outline_rounded,
                        'Về ứng dụng',
                        textTheme,
                      ),
                      const SizedBox(height: 12),
                      AppTheme.glassPanel(
                        padding: EdgeInsets.zero,
                        child: ListTile(
                          leading: const Icon(
                            Icons.info_outline_rounded,
                            color: AppTheme.onSurfaceVariant,
                            size: 20,
                          ),
                          title: const Text(
                            'Thông tin & Điều khoản',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          trailing: const Icon(
                            Icons.chevron_right_rounded,
                            color: AppTheme.onSurfaceVariant,
                            size: 20,
                          ),
                          onTap: () => _showAboutAppDialog(context),
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Section: Vùng nguy hiểm
                      _buildSectionHeader(
                        Icons.report_problem_outlined,
                        'Vùng nguy hiểm',
                        textTheme,
                      ),
                      const SizedBox(height: 12),
                      AppTheme.glassPanel(
                        padding: EdgeInsets.zero,
                        child: ListTile(
                          leading: const Icon(
                            Icons.delete_forever_rounded,
                            color: Color(0xFFE46C6C),
                            size: 20,
                          ),
                          title: const Text(
                            'Xóa tài khoản',
                            style: TextStyle(
                              color: Color(0xFFE46C6C),
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          subtitle: const Text(
                            'Xóa vĩnh viễn tài khoản và dữ liệu học tập',
                            style: TextStyle(
                              color: AppTheme.onSurfaceVariant,
                              fontSize: 12,
                            ),
                          ),
                          onTap: () => _onDeleteAccount(context),
                        ),
                      ),
                      const SizedBox(height: 36),

                      // Action Button
                      ElevatedButton(
                        onPressed: _onSavePressed,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          foregroundColor: AppTheme.onPrimaryContainer,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                        ),
                        child: Text(
                          'Lưu thay đổi',
                          style: textTheme.labelLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.onPrimaryContainer,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title, TextTheme textTheme) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.secondaryColor, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
    bool enabled = true,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.onSurfaceVariant,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          enabled: enabled,
          style: TextStyle(
            color: enabled ? Colors.white : Colors.white60,
            fontSize: 14,
          ),
          decoration: InputDecoration(
            hintText: hint,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            filled: !enabled,
            fillColor: enabled
                ? Colors.transparent
                : Colors.white.withOpacity(0.03),
          ),
        ),
      ],
    );
  }

  Widget _buildToggleRow({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppTheme.onSurfaceVariant,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        Switch(
          value: value,
          activeColor: AppTheme.primaryColor,
          activeTrackColor: AppTheme.primaryContainer.withOpacity(0.5),
          inactiveThumbColor: AppTheme.onSurfaceVariant,
          inactiveTrackColor: Colors.white10,
          onChanged: onChanged,
        ),
      ],
    );
  }
}
