import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_theme.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';
import 'home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _onRegisterPressed() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(
        AuthRegisterRequested(
          fullName: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const HomeScreen()),
              (route) => false,
            );
          }
        },
        builder: (context, state) {
          return Stack(
            children: [
              // Background Ambient Glows
              Container(
                width: double.infinity,
                height: double.infinity,
                color: AppTheme.backgroundColor,
              ),
              Positioned(
                top: -size.height * 0.2,
                left: -size.width * 0.3,
                child: Container(
                  width: size.width * 0.8,
                  height: size.width * 0.8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.primaryColor.withOpacity(0.05),
                  ),
                ),
              ),
              Positioned(
                bottom: -size.height * 0.2,
                right: -size.width * 0.3,
                child: Container(
                  width: size.width * 0.9,
                  height: size.width * 0.9,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.secondaryColor.withOpacity(0.05),
                  ),
                ),
              ),

              SafeArea(
                child: Center(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Back Button
                          Align(
                            alignment: Alignment.centerLeft,
                            child: IconButton(
                              onPressed: () {
                                Navigator.pop(context);
                              },
                              icon: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.arrow_back_rounded, color: AppTheme.primaryColor, size: 20),
                                  SizedBox(width: 4),
                                  Text(
                                    'QUAY LẠI',
                                    style: TextStyle(
                                      color: AppTheme.primaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                      letterSpacing: 1.0,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Header Logo
                          Column(
                            children: [
                              Text(
                                'VSL LEARNER',
                                style: textTheme.headlineLarge?.copyWith(
                                  color: AppTheme.primaryColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 28,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Học Ngôn Ngữ Ký Hiệu Việt Nam',
                                style: textTheme.bodyMedium?.copyWith(
                                  color: AppTheme.onSurfaceVariant,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Registration Glass Panel
                          AppTheme.glassPanel(
                            padding: const EdgeInsets.all(24.0),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'Đăng ký',
                                    textAlign: TextAlign.center,
                                    style: textTheme.headlineMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 22,
                                    ),
                                  ),
                                  const SizedBox(height: 20),

                                  // Error Alert
                                  if (state is AuthFailure) ...[
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE46C6C).withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: const Color(0xFFE46C6C).withOpacity(0.3),
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.error_outline_rounded, color: Color(0xFFE46C6C), size: 20),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              state.error,
                                              style: textTheme.bodyMedium?.copyWith(
                                                color: const Color(0xFFE46C6C),
                                                fontSize: 13,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                  ],

                                  // Full Name Field
                                  Text(
                                    'Họ tên',
                                    style: textTheme.labelLarge?.copyWith(
                                      color: AppTheme.onSurfaceVariant,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  TextFormField(
                                    controller: _nameController,
                                    keyboardType: TextInputType.name,
                                    textInputAction: TextInputAction.next,
                                    decoration: const InputDecoration(
                                      prefixIcon: Icon(Icons.person_outline_rounded),
                                      hintText: 'Nhập họ và tên',
                                    ),
                                    validator: (value) {
                                      if (value == null || value.trim().isEmpty) {
                                        return 'Vui lòng nhập họ tên';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 16),

                                  // Email Field
                                  Text(
                                    'Email',
                                    style: textTheme.labelLarge?.copyWith(
                                      color: AppTheme.onSurfaceVariant,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  TextFormField(
                                    controller: _emailController,
                                    keyboardType: TextInputType.emailAddress,
                                    textInputAction: TextInputAction.next,
                                    decoration: const InputDecoration(
                                      prefixIcon: Icon(Icons.mail_outline_rounded),
                                      hintText: 'example@email.com',
                                    ),
                                    validator: (value) {
                                      if (value == null || value.trim().isEmpty) {
                                        return 'Vui lòng nhập email';
                                      }
                                      final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
                                      if (!emailRegex.hasMatch(value.trim())) {
                                        return 'Vui lòng nhập email hợp lệ';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 16),

                                  // Password Field
                                  Text(
                                    'Mật khẩu',
                                    style: textTheme.labelLarge?.copyWith(
                                      color: AppTheme.onSurfaceVariant,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  TextFormField(
                                    controller: _passwordController,
                                    obscureText: _obscurePassword,
                                    textInputAction: TextInputAction.next,
                                    decoration: InputDecoration(
                                      prefixIcon: const Icon(Icons.lock_outline_rounded),
                                      hintText: '••••••••',
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _obscurePassword
                                              ? Icons.visibility_off_outlined
                                              : Icons.visibility_outlined,
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _obscurePassword = !_obscurePassword;
                                          });
                                        },
                                      ),
                                    ),
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Vui lòng nhập mật khẩu';
                                      }
                                      if (value.length < 6) {
                                        return 'Mật khẩu phải dài ít nhất 6 ký tự';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 16),

                                  // Confirm Password Field
                                  Text(
                                    'Xác nhận mật khẩu',
                                    style: textTheme.labelLarge?.copyWith(
                                      color: AppTheme.onSurfaceVariant,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  TextFormField(
                                    controller: _confirmPasswordController,
                                    obscureText: _obscurePassword,
                                    textInputAction: TextInputAction.done,
                                    onFieldSubmitted: (_) => _onRegisterPressed(),
                                    decoration: const InputDecoration(
                                      prefixIcon: Icon(Icons.lock_reset_rounded),
                                      hintText: '••••••••',
                                    ),
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Vui lòng xác nhận mật khẩu';
                                      }
                                      if (value != _passwordController.text) {
                                        return 'Mật khẩu xác nhận không khớp';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 24),

                                  // Submit button
                                  ElevatedButton(
                                    onPressed: state is AuthLoading ? null : _onRegisterPressed,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primaryContainer,
                                      foregroundColor: AppTheme.onPrimaryContainer,
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8.0),
                                      ),
                                      elevation: 0,
                                    ),
                                    child: state is AuthLoading
                                        ? const SizedBox(
                                            height: 20,
                                            width: 20,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              valueColor: AlwaysStoppedAnimation(
                                                AppTheme.onPrimaryContainer,
                                              ),
                                            ),
                                          )
                                        : Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Text(
                                                'Đăng ký',
                                                style: textTheme.labelLarge?.copyWith(
                                                  fontWeight: FontWeight.bold,
                                                  color: AppTheme.onPrimaryContainer,
                                                  fontSize: 16,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              const Icon(Icons.arrow_forward_rounded, size: 20),
                                            ],
                                          ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Redirect link
                          Wrap(
                            alignment: WrapAlignment.center,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(
                                'Đã có tài khoản? ',
                                style: textTheme.bodyMedium?.copyWith(
                                  color: AppTheme.onSurfaceVariant,
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.pop(context); // Go back to login
                                },
                                child: Text(
                                  'Đăng nhập',
                                  style: textTheme.bodyMedium?.copyWith(
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
