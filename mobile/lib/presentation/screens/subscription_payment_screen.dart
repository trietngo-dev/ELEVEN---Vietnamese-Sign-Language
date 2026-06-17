import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../data/datasources/profile_data_source.dart';


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
                            onPressed: () => _openCheckoutDrawer(context, mintColor, currentBgColor, currentCardColor, currentTextColor, currentTextMutedColor),
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

  void _openCheckoutDrawer(BuildContext context, Color mintColor, Color bg, Color cardBg, Color textColor, Color textMutedColor) {
    if (_plans.isEmpty || _selectedPlanId == null) return;
    
    final selectedData = _plans.firstWhere(
      (p) => (p['code'] ?? p['Code'] ?? p['id'] ?? p['Id']).toString() == _selectedPlanId,
      orElse: () => _plans.first,
    );
    final String pName = (selectedData['name'] ?? selectedData['Name'] ?? 'Gói VIP').toString();
    final num pPriceVal = (selectedData['priceVnd'] ?? selectedData['PriceVnd'] ?? 0) as num;
    final String pPrice = formatVnd(pPriceVal);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) {
        return _CheckoutBottomSheet(
          planName: pName,
          planPrice: pPrice,
          mintColor: mintColor,
          bgColor: bg,
          cardColor: cardBg,
          textColor: textColor,
          textMutedColor: textMutedColor,
        );
      },
    );
  }
}

class _CheckoutBottomSheet extends StatefulWidget {
  final String planName;
  final String planPrice;
  final Color mintColor;
  final Color bgColor;
  final Color cardColor;
  final Color textColor;
  final Color textMutedColor;

  const _CheckoutBottomSheet({
    required this.planName,
    required this.planPrice,
    required this.mintColor,
    required this.bgColor,
    required this.cardColor,
    required this.textColor,
    required this.textMutedColor,
  });

  @override
  State<_CheckoutBottomSheet> createState() => _CheckoutBottomSheetState();
}

class _CheckoutBottomSheetState extends State<_CheckoutBottomSheet> {
  int _paymentMethod = 0; // 0 = Credit Card, 1 = VietQR/Momo Transfer
  bool _isProcessing = false;
  bool _isSuccess = false;
  int _countdown = 15;
  Timer? _qrTimer;

  final _cardNumberController = TextEditingController(text: '4312 8900 1234 5678');
  final _cardHolderController = TextEditingController(text: 'NGUYEN VAN A');
  final _cardExpiryController = TextEditingController(text: '12/29');
  final _cardCvvController = TextEditingController(text: '999');

  @override
  void dispose() {
    _qrTimer?.cancel();
    _cardNumberController.dispose();
    _cardHolderController.dispose();
    _cardExpiryController.dispose();
    _cardCvvController.dispose();
    super.dispose();
  }

  void _startQrTimer() {
    _qrTimer?.cancel();
    setState(() {
      _countdown = 15;
    });
    _qrTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown == 0) {
        _qrTimer?.cancel();
        _simulatePaymentSuccess();
      } else {
        setState(() {
          _countdown--;
        });
      }
    });
  }

  void _processPayment() {
    setState(() {
      _isProcessing = true;
    });
    Timer(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _isSuccess = true;
        });
      }
    });
  }

  void _simulatePaymentSuccess() {
    if (mounted) {
      setState(() {
        _isSuccess = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final double keyboardPadding = MediaQuery.of(context).viewInsets.bottom;

    if (_isSuccess) {
      return Container(
        padding: const EdgeInsets.all(24),
        height: 380,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF10B981),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_rounded, size: 48, color: Colors.white),
            ),
            const SizedBox(height: 20),
            Text(
              "Thanh toán thành công!",
              style: GoogleFonts.quicksand(color: widget.textColor, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              "Tài khoản của bạn đã được nâng cấp lên VIP (${widget.planName})",
              style: TextStyle(color: widget.textColor.withValues(alpha: 0.6), fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close bottom sheet
                Navigator.of(context).pop(); // Back to Profile screen
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: widget.mintColor,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text("Tuyệt vời", style: TextStyle(fontWeight: FontWeight.bold)),
            )
          ],
        ),
      );
    }

    if (_isProcessing) {
      return Container(
        height: 320,
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: widget.mintColor),
            const SizedBox(height: 20),
            Text(
              "Đang xử lý giao dịch an toàn...",
              style: TextStyle(color: widget.textColor, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              "Vui lòng không đóng ứng dụng.",
              style: TextStyle(color: widget.textColor.withValues(alpha: 0.3), fontSize: 11),
            )
          ],
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.only(bottom: keyboardPadding),
      child: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Bottom sheet handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: widget.textColor.withValues(alpha: 0.24),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Summary
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Gói nâng cấp", style: TextStyle(color: widget.textColor.withValues(alpha: 0.6), fontSize: 11)),
                      const SizedBox(height: 2),
                      Text("VSL PRO - ${widget.planName}", style: TextStyle(color: widget.textColor, fontWeight: FontWeight.bold, fontSize: 15)),
                    ],
                  ),
                  Text(widget.planPrice, style: GoogleFonts.quicksand(color: widget.mintColor, fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 16),
              Divider(color: widget.textColor.withValues(alpha: 0.12)),
              const SizedBox(height: 12),

              // Payment Method Selectors
              Text("Phương thức thanh toán", style: TextStyle(color: widget.textColor.withValues(alpha: 0.7), fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildMethodButton(
                      index: 0,
                      label: 'Thẻ Visa/Master',
                      icon: Icons.credit_card_rounded,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildMethodButton(
                      index: 1,
                      label: 'Quét mã VietQR',
                      icon: Icons.qr_code_scanner_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Payment Details Forms
              if (_paymentMethod == 0) ...[
                // Credit Card form
                _buildTextField('Số thẻ tín dụng', _cardNumberController, Icons.credit_card),
                const SizedBox(height: 12),
                _buildTextField('Tên chủ thẻ (Viết hoa không dấu)', _cardHolderController, Icons.person),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildTextField('Hạn dùng (MM/YY)', _cardExpiryController, Icons.calendar_today)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildTextField('Mã bảo mật CVV', _cardCvvController, Icons.lock_outline)),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _processPayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.mintColor,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Thanh Toán Ngay', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ] else ...[
                // VietQR scan mock
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.network('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg', width: 140, height: 140, fit: BoxFit.contain, errorBuilder: (ctx, err, stack) => const Icon(Icons.qr_code_2, size: 140, color: Colors.black)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text("Chuyển khoản VietQR nhanh", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Hệ thống đang kiểm tra giao dịch tự động... ($_countdown s)",
                      style: const TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ElevatedButton.icon(
                          onPressed: _simulatePaymentSuccess,
                          icon: const Icon(Icons.done_all_rounded, size: 14),
                          label: const Text("Giả lập Quét thành công", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white.withValues(alpha: 0.1),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMethodButton({required int index, required String label, required IconData icon}) {
    final isSelected = _paymentMethod == index;
    return InkWell(
      onTap: () {
        setState(() {
          _paymentMethod = index;
        });
        if (index == 1) {
          _startQrTimer();
        } else {
          _qrTimer?.cancel();
        }
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected ? widget.mintColor.withValues(alpha: 0.1) : widget.bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? widget.mintColor : widget.textColor.withValues(alpha: 0.05),
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? widget.mintColor : widget.textColor.withValues(alpha: 0.7), size: 20),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(color: isSelected ? Colors.white : widget.textColor.withValues(alpha: 0.6), fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: widget.textColor.withValues(alpha: 0.6), fontSize: 11)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          style: TextStyle(color: widget.textColor, fontSize: 13, fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            fillColor: widget.bgColor,
            filled: true,
            prefixIcon: Icon(icon, color: widget.textColor.withValues(alpha: 0.3), size: 16),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ],
    );
  }
}
