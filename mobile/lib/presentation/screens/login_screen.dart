import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/gestures.dart';
import 'terms_policy_screen.dart';
import '../bloc/auth_bloc.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isRegister = false;
  bool _agreedToTerms = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }



  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      if (_isRegister && !_agreedToTerms) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text("Bạn phải đồng ý với Điều khoản dịch vụ & Chính sách bảo mật để tiếp tục."),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        return;
      }
      final authBloc = context.read<AuthBloc>();
      if (_isRegister) {
        authBloc.add(AuthRegisterRequested(
          fullName: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text.trim(),
        ));
      } else {
        authBloc.add(AuthLoginRequested(
          _emailController.text.trim(),
          _passwordController.text.trim(),
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const HomeScreen()),
            );
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  state.error,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                backgroundColor: theme.colorScheme.error,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            );
          }
        },
        builder: (context, state) {
          return Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.white,
                  Color(0xFFF8FDF8),
                  Color(0xFFEDF6E4),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Premium Brand Logo Header
                        Hero(
                          tag: 'brand_logo',
                          child: Center(
                            child: Container(
                              height: 80,
                              width: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: theme.primaryColor.withValues(alpha: 0.2), width: 2),
                              ),
                              child: ClipOval(
                                child: Image.asset(
                                  'assets/logo.jpg',
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          "ELEVEN",
                          textAlign: TextAlign.center,
                          style: GoogleFonts.quicksand(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: theme.primaryColor,
                            letterSpacing: 0.5,
                          ),
                        ),

                        Text(
                          _isRegister ? "Đăng ký tài khoản học tập" : "Chào mừng trở lại học viên!",
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 36),
                        
                        // Form Fields Card
                        Card(
                          elevation: 8,
                          shadowColor: theme.primaryColor.withValues(alpha: 0.04),
                          child: Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                if (_isRegister) ...[
                                  TextFormField(
                                    controller: _nameController,
                                    decoration: const InputDecoration(
                                      labelText: "Họ và tên",
                                      hintText: "Nhập họ tên của bạn",
                                      prefixIcon: Icon(Icons.person_outline_rounded),
                                    ),
                                    validator: (val) => (val == null || val.isEmpty) ? "Vui lòng nhập họ tên" : null,
                                  ),
                                  const SizedBox(height: 16),
                                ],
                                TextFormField(
                                  controller: _emailController,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: const InputDecoration(
                                    labelText: "Email",
                                    hintText: "vidu@domain.com",
                                    prefixIcon: Icon(Icons.email_outlined),
                                  ),
                                  validator: (val) {
                                    if (val == null || val.isEmpty) return "Vui lòng nhập email";
                                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(val)) {
                                      return "Định dạng email không hợp lệ";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                                TextFormField(
                                  controller: _passwordController,
                                  obscureText: true,
                                  decoration: const InputDecoration(
                                    labelText: "Mật khẩu",
                                    hintText: "••••••••",
                                    prefixIcon: Icon(Icons.lock_outlined),
                                  ),
                                  validator: (val) => (val == null || val.length < 6) ? "Mật khẩu phải từ 6 ký tự" : null,
                                ),
                                if (_isRegister) ...[
                                  const SizedBox(height: 16),
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      SizedBox(
                                        height: 24,
                                        width: 24,
                                        child: Checkbox(
                                          value: _agreedToTerms,
                                          activeColor: theme.primaryColor,
                                          onChanged: (val) {
                                            setState(() {
                                              _agreedToTerms = val ?? false;
                                            });
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: RichText(
                                          text: TextSpan(
                                            style: GoogleFonts.quicksand(
                                              fontSize: 12,
                                              color: const Color(0xFF5B6068),
                                              height: 1.4,
                                            ),
                                            children: [
                                              const TextSpan(text: "Tôi đồng ý với "),
                                              TextSpan(
                                                text: "Điều khoản dịch vụ",
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  color: theme.primaryColor,
                                                  decoration: TextDecoration.underline,
                                                ),
                                                recognizer: TapGestureRecognizer()
                                                  ..onTap = () {
                                                    Navigator.push(
                                                      context,
                                                      MaterialPageRoute(
                                                        builder: (_) => const TermsPolicyScreen(isTerms: true),
                                                      ),
                                                    );
                                                  },
                                              ),
                                              const TextSpan(text: " & "),
                                              TextSpan(
                                                text: "Chính sách bảo mật",
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  color: theme.primaryColor,
                                                  decoration: TextDecoration.underline,
                                                ),
                                                recognizer: TapGestureRecognizer()
                                                  ..onTap = () {
                                                    Navigator.push(
                                                      context,
                                                      MaterialPageRoute(
                                                        builder: (_) => const TermsPolicyScreen(isTerms: false),
                                                      ),
                                                    );
                                                  },
                                              ),
                                              const TextSpan(text: " của Eleven."),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                                const SizedBox(height: 24),
                                
                                // Submit Button
                                state is AuthLoading
                                    ? Center(
                                        child: CircularProgressIndicator(
                                          color: theme.primaryColor,
                                        ),
                                      )
                                    : ElevatedButton(
                                        onPressed: _submit,
                                        child: Text(
                                          _isRegister ? "Đăng Ký Ngay" : "Đăng Nhập",
                                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _isRegister = !_isRegister;
                              _agreedToTerms = false;
                              _formKey.currentState?.reset();
                            });
                          },
                          child: Text(
                            _isRegister ? "Đã có tài khoản? Đăng nhập ngay" : "Chưa có tài khoản? Đăng ký tại đây",
                            style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
