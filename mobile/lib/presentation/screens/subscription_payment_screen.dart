import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../data/datasources/profile_data_source.dart';
import 'payment_webview_screen.dart';


class SubscriptionPaymentScreen extends StatefulWidget {
  const SubscriptionPaymentScreen({super.key});

  @override
  State<SubscriptionPaymentScreen> createState() => _SubscriptionPaymentScreenState();
}

class _SubscriptionPaymentScreenState extends State<SubscriptionPaymentScreen> {
  List<Map<String, dynamic>> _plans = [];
  bool _isLoadingPlans = true;
  String? _errorMessage;
  String? _selectedPlanId; // Will store the selected plan's Code or Id
  int? _expandedPlanIndex; // Track which plan is expanded for "Xem chi tiết"

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    try {
      final ds = context.read<ProfileDataSource>();
      final dbPlans = await ds.getSubscriptionPlans();
      if (mounted) {
        setState(() {
          _plans = dbPlans.where((plan) => plan['isActive'] ?? plan['IsActive'] ?? true).toList();
          if (_plans.isNotEmpty) {
            _plans.sort((a, b) {
              final aOrd = (a['displayOrder'] ?? a['DisplayOrder'] ?? 0) as int;
              final bOrd = (b['displayOrder'] ?? b['DisplayOrder'] ?? 0) as int;
              return aOrd.compareTo(bOrd);
            });
            _selectedPlanId = (_plans[0]['code'] ?? _plans[0]['Code'] ?? _plans[0]['id'] ?? _plans[0]['Id']).toString();
          }
          _isLoadingPlans = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isLoadingPlans = false;
        });
      }
    }
  }

  String formatVnd(num price) {
    final s = price.toInt().toString();
    final buffer = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(s[i]);
    }
    return "${buffer.toString()} đ";
  }

  String _getPlanSubText(Map<String, dynamic> plan) {
    final String code = (plan['code'] ?? plan['Code'] ?? '').toString().toUpperCase();
    if (code.contains('MONTH') || code.contains('THANG')) {
      return 'Đăng ký theo tháng';
    } else if (code.contains('YEAR') || code.contains('NAM') || code.contains('ANNUAL')) {
      final priceVal = (plan['priceVnd'] ?? plan['PriceVnd'] ?? 0) as num;
      final monthlyEst = (priceVal / 12).round();
      return 'Chỉ ${formatVnd(monthlyEst)} / tháng (Tiết kiệm 50%)';
    } else if (code.contains('LIFE') || code.contains('TRONDOI')) {
      return 'Thanh toán 1 lần, dùng mãi mãi';
    }
    return plan['billingCycle'] ?? plan['BillingCycle'] ?? 'Thành viên cao cấp';
  }

  String _getPlanTag(Map<String, dynamic> plan) {
    final String code = (plan['code'] ?? plan['Code'] ?? '').toString().toUpperCase();
    if (code.contains('YEAR') || code.contains('NAM') || code.contains('ANNUAL')) {
      return 'PHỔ BIẾN NHẤT';
    } else if (code.contains('LIFE') || code.contains('TRONDOI')) {
      return 'HỜI NHẤT';
    }
    return '';
  }

  Widget _buildDetailRow(String label, String value, Color labelColor, Color valueColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: labelColor, fontSize: 11)),
          Text(value, style: TextStyle(color: valueColor, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
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
        final Color borderColor = isWhiteBg ? const Color(0xFFC2DFCA) : Colors.white.withValues(alpha: 0.04);

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
              "GÓI NÂNG CẤP VIP",
              style: GoogleFonts.quicksand(
                fontWeight: FontWeight.bold,
                color: currentTextColor,
                fontSize: 18,
              ),
            ),
            centerTitle: true,
          ),
          body: _isLoadingPlans
              ? const Center(child: CircularProgressIndicator(color: mintColor))
              : _errorMessage != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 14), textAlign: TextAlign.center),
                      ),
                    )
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Hero info
                          Container(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            child: Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.amber.withValues(alpha: 0.15),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.workspace_premium_rounded, color: Colors.amber, size: 36),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  "Trở thành thành viên VSL PRO",
                                  style: GoogleFonts.quicksand(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: currentTextColor,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  "Mở khóa toàn bộ kho tài liệu, nhận diện cử chỉ AI không giới hạn, không quảng cáo và sở hữu khung hoàng gia độc quyền.",
                                  style: TextStyle(color: currentTextMutedColor, fontSize: 12, height: 1.4),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Plan selections
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _plans.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final plan = _plans[index];
                              final planId = (plan['code'] ?? plan['Code'] ?? plan['id'] ?? plan['Id']).toString();
                              final isSelected = _selectedPlanId == planId;
                              final planName = (plan['name'] ?? plan['Name'] ?? '').toString();
                              final num priceVal = (plan['priceVnd'] ?? plan['PriceVnd'] ?? 0) as num;
                              final planPriceText = formatVnd(priceVal);
                              final tag = _getPlanTag(plan);
                              final subText = _getPlanSubText(plan);

                              return InkWell(
                                onTap: () {
                                  setState(() {
                                    _selectedPlanId = planId;
                                  });
                                },
                                borderRadius: BorderRadius.circular(24),
                                child: Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: currentCardColor,
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(
                                      color: isSelected ? mintColor : borderColor,
                                      width: isSelected ? 2.0 : 1.0,
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    Text(
                                                      planName,
                                                      style: TextStyle(color: currentTextColor, fontWeight: FontWeight.bold, fontSize: 16),
                                                    ),
                                                    if (tag.isNotEmpty) ...[
                                                      const SizedBox(width: 10),
                                                      Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                        decoration: BoxDecoration(
                                                          color: Colors.amber.withValues(alpha: 0.15),
                                                          borderRadius: BorderRadius.circular(8),
                                                        ),
                                                        child: Text(
                                                          tag,
                                                          style: const TextStyle(color: Colors.amber, fontSize: 8, fontWeight: FontWeight.bold),
                                                        ),
                                                      ),
                                                    ],
                                                  ],
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  subText,
                                                  style: TextStyle(color: currentTextMutedColor, fontSize: 11),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Text(
                                            planPriceText,
                                            style: GoogleFonts.quicksand(
                                              color: isSelected ? mintColor : currentTextColor,
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                      
                                      const SizedBox(height: 12),
                                      // Click for details
                                      Align(
                                        alignment: Alignment.centerRight,
                                        child: InkWell(
                                          onTap: () {
                                            setState(() {
                                              if (_expandedPlanIndex == index) {
                                                _expandedPlanIndex = null;
                                              } else {
                                                _expandedPlanIndex = index;
                                              }
                                            });
                                          },
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(vertical: 4.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text(
                                                  _expandedPlanIndex == index ? "Thu gọn" : "Xem chi tiết",
                                                  style: const TextStyle(color: mintColor, fontSize: 12, fontWeight: FontWeight.bold),
                                                ),
                                                const SizedBox(width: 4),
                                                Icon(
                                                  _expandedPlanIndex == index 
                                                      ? Icons.keyboard_arrow_up_rounded
                                                      : Icons.keyboard_arrow_down_rounded,
                                                  color: mintColor,
                                                  size: 16,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                      
                                      if (_expandedPlanIndex == index) ...[
                                        const SizedBox(height: 12),
                                        Divider(color: currentTextColor.withValues(alpha: 0.1)),
                                        const SizedBox(height: 8),
                                        _buildDetailRow("Giới hạn dịch thuật", "${plan['dailyTranslationLimit'] ?? plan['DailyTranslationLimit'] ?? 0} từ/ngày", currentTextMutedColor, currentTextColor),
                                        _buildDetailRow("Lượt luyện tập AI", "${plan['aiPracticeLimit'] ?? plan['AiPracticeLimit'] ?? 0} lượt/ngày", currentTextMutedColor, currentTextColor),
                                        _buildDetailRow("Phạm vi khóa học", (plan['courseAccessScope'] ?? plan['CourseAccessScope'] ?? 'Tất cả').toString(), currentTextMutedColor, currentTextColor),
                                        _buildDetailRow("Lưu lịch sử học", (plan['canSaveHistory'] ?? plan['CanSaveHistory'] ?? false) ? "Có" : "Không", currentTextMutedColor, currentTextColor),
                                        _buildDetailRow("Chứng chỉ đi kèm", (plan['certificateEnabled'] ?? plan['CertificateEnabled'] ?? false) ? "Có" : "Không", currentTextMutedColor, currentTextColor),
                                        _buildDetailRow("Hỗ trợ ưu tiên", (plan['prioritySupport'] ?? plan['PrioritySupport'] ?? false) ? "Có" : "Không", currentTextMutedColor, currentTextColor),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 32),

                          // Checkout Button
                          ElevatedButton(
                            onPressed: () => _startActualPayment(context),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: mintColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 4,
                            ),
                            child: Text(
                              "Đăng Ký Ngay",
                              style: GoogleFonts.quicksand(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
        );
      },
    );
  }

  Future<void> _startActualPayment(BuildContext context) async {
    if (_plans.isEmpty || _selectedPlanId == null) return;
    
    final selectedData = _plans.firstWhere(
      (p) => (p['code'] ?? p['Code'] ?? p['id'] ?? p['Id']).toString() == _selectedPlanId,
      orElse: () => _plans.first,
    );
    final planId = (selectedData['id'] ?? selectedData['Id']) as int;
    final planName = (selectedData['name'] ?? selectedData['Name'] ?? 'Gói VIP').toString();

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(
        child: CircularProgressIndicator(color: Color(0xFF10B981)),
      ),
    );

    try {
      final ds = context.read<ProfileDataSource>();
      const returnUrl = "https://elevensignlanguage.io.vn/payment-success";
      const cancelUrl = "https://elevensignlanguage.io.vn/payment-cancel";

      final result = await ds.createPaymentLink(
        planId: planId,
        returnUrl: returnUrl,
        cancelUrl: cancelUrl,
      );

      // Close loading dialog
      if (context.mounted) {
        Navigator.pop(context);
      }

      final checkoutUrl = (result['checkoutUrl'] ?? result['CheckoutUrl'] ?? '').toString();
      final orderCode = (result['orderCode'] ?? result['OrderCode']) as int;

      if (checkoutUrl.isEmpty) {
        throw Exception("Không nhận được liên kết thanh toán từ máy chủ.");
      }

      // Open in-app WebView
      if (context.mounted) {
        final paymentSuccess = await Navigator.push<bool>(
          context,
          MaterialPageRoute(
            builder: (_) => PaymentWebviewScreen(
              checkoutUrl: checkoutUrl,
              orderCode: orderCode,
              returnUrl: returnUrl,
              cancelUrl: cancelUrl,
            ),
          ),
        );

        if (paymentSuccess == true) {
          if (context.mounted) {
            _showPaymentSuccessModal(context, planName);
          }
        } else {
          if (context.mounted) {
            _showPaymentErrorSnackBar(context, "Thanh toán bị hủy hoặc thất bại.");
          }
        }
      }
    } catch (e) {
      // Close loading dialog if open
      if (context.mounted) {
        Navigator.pop(context);
        _showPaymentErrorSnackBar(context, "Lỗi tạo link thanh toán: ${e.toString().replaceAll('Exception: ', '')}");
      }
    }
  }

  void _showPaymentSuccessModal(BuildContext context, String planName) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF131A16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_rounded, size: 48, color: Colors.white),
              ),
              const SizedBox(height: 24),
              const Text(
                "Thanh toán thành công!",
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                "Tài khoản của bạn đã được nâng cấp lên VIP ($planName) thành công.",
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx); // Close dialog
                  Navigator.pop(context); // Close SubscriptionPaymentScreen
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text("Về trang cá nhân", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showPaymentErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
