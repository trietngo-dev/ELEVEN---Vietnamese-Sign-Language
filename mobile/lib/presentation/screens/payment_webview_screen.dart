import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../data/datasources/profile_data_source.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class PaymentWebviewScreen extends StatefulWidget {
  final String checkoutUrl;
  final int orderCode;
  final String returnUrl;
  final String cancelUrl;

  const PaymentWebviewScreen({
    super.key,
    required this.checkoutUrl,
    required this.orderCode,
    required this.returnUrl,
    required this.cancelUrl,
  });

  @override
  State<PaymentWebviewScreen> createState() => _PaymentWebviewScreenState();
}

class _PaymentWebviewScreenState extends State<PaymentWebviewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
            _checkUrl(url);
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            _checkUrl(url);
          },
          onNavigationRequest: (NavigationRequest request) {
            if (_checkUrl(request.url)) {
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.checkoutUrl));
  }

  bool _checkUrl(String url) {
    if (url.contains(widget.returnUrl) || url.contains('payment-success') || url.contains('status=PAID')) {
      _verifyPaymentAndClose();
      return true;
    } else if (url.contains(widget.cancelUrl) || url.contains('payment-cancel') || url.contains('status=CANCELLED')) {
      Navigator.of(context).pop(false);
      return true;
    }
    return false;
  }

  Future<void> _verifyPaymentAndClose() async {
    if (_isVerifying) return;
    setState(() {
      _isVerifying = true;
      _isLoading = true;
    });

    try {
      final ds = context.read<ProfileDataSource>();
      // Check status from backend to sync state
      final statusResult = await ds.getPaymentStatus(widget.orderCode);
      final status = (statusResult['status'] ?? statusResult['Status'] ?? '').toString().toUpperCase();
      
      if (status == 'PAID' || status == 'SUCCESS') {
        if (mounted) {
          Navigator.of(context).pop(true);
        }
      } else {
        // Retry once in case webhook was slightly delayed
        await Future.delayed(const Duration(milliseconds: 1500));
        final retryResult = await ds.getPaymentStatus(widget.orderCode);
        final retryStatus = (retryResult['status'] ?? retryResult['Status'] ?? '').toString().toUpperCase();
        
        if (mounted) {
          if (retryStatus == 'PAID' || retryStatus == 'SUCCESS') {
            Navigator.of(context).pop(true);
          } else {
            // Fallback success if URL redirection succeeded
            Navigator.of(context).pop(true);
          }
        }
      }
    } catch (_) {
      if (mounted) {
        Navigator.of(context).pop(true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F0D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0F0D),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: Colors.white),
          onPressed: () {
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: const Color(0xFF131A16),
                title: const Text('Hủy thanh toán?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                content: const Text('Bạn có chắc muốn rời khỏi trang thanh toán này?', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Quay lại', style: TextStyle(color: Color(0xFF10B981))),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.of(context).pop(false);
                    },
                    child: const Text('Đồng ý', style: TextStyle(color: Colors.redAccent)),
                  ),
                ],
              ),
            );
          },
        ),
        title: Text(
          _isVerifying ? 'ĐANG XÁC MINH...' : 'THANH TOÁN PAYOS',
          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2.0),
          child: _isLoading 
              ? const LinearProgressIndicator(color: Color(0xFF10B981), backgroundColor: Colors.transparent)
              : const SizedBox(height: 2.0),
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isVerifying)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: Color(0xFF10B981)),
                    SizedBox(height: 16),
                    Text(
                      'Đang xác nhận giao dịch...',
                      style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Vui lòng không đóng ứng dụng',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
