import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/datasources/profile_data_source.dart';
import '../../data/models/avatar_frame_model.dart';

class FrameShopScreen extends StatefulWidget {
  const FrameShopScreen({super.key});

  @override
  State<FrameShopScreen> createState() => _FrameShopScreenState();
}

class _FrameShopScreenState extends State<FrameShopScreen> {
  List<AvatarFrameModel> _frames = [];
  List<int> _ownedFrameIds = [];
  int? _activeFrameId;
  int _userXp = 0;
  int _userId = 1;
  bool _isLoading = true;
  bool _isActionRunning = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    final ds = context.read<ProfileDataSource>();
    setState(() {
      _isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      _userId = prefs.getInt('auth_user_id') ?? 1;

      // 1. Fetch user profile from server to get real total XP & active frame ID
      final profile = await ds.getUserProfile(_userId);
      _userXp = (profile['totalXp'] ?? profile['TotalXp'] ?? 0) as int;
      _activeFrameId = (profile['activeFrameId'] ?? profile['ActiveFrameId']) as int?;

      // Sync XP locally
      await prefs.setInt('auth_user_xp', _userXp);

      // 2. Fetch all frames
      final allFrames = await ds.getAvatarFrames();

      // 3. Fetch owned frames
      final ownedFrames = await ds.getOwnedAvatarFrames();
      _ownedFrameIds = ownedFrames.map((f) => f.id).toList();

      // Ensure default frame is owned (free presets if any, else mapped)
      if (mounted) {
        setState(() {
          _frames = allFrames;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi tải dữ liệu cửa hàng: $e'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _redeemFrame(AvatarFrameModel frame) async {
    if (_isActionRunning) return;
    setState(() {
      _isActionRunning = true;
    });

    try {
      final ds = context.read<ProfileDataSource>();
      final result = await ds.redeemAvatarFrame(frame.id);
      
      // Auto-equip redeemed frame
      await ds.equipAvatarFrame(frame.id);

      final prefs = await SharedPreferences.getInstance();
      final newXp = (result['totalXp'] ?? _userXp - frame.xpPrice) as int;
      await prefs.setInt('auth_user_xp', newXp);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã quy đổi thành công khung: ${frame.name}!'),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      
      await _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Quy đổi thất bại: $e'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isActionRunning = false;
        });
      }
    }
  }

  Future<void> _equipFrame(int? frameId) async {
    if (_isActionRunning) return;
    setState(() {
      _isActionRunning = true;
    });

    try {
      final ds = context.read<ProfileDataSource>();
      await ds.equipAvatarFrame(frameId);

      // Save active frame url or details in local preferences
      final prefs = await SharedPreferences.getInstance();
      if (frameId != null) {
        final frame = _frames.firstWhere((f) => f.id == frameId);
        await prefs.setString('auth_user_active_frame_url', frame.imageUrl);
      } else {
        await prefs.remove('auth_user_active_frame_url');
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(frameId == null ? 'Đã tháo khung ảnh đại diện!' : 'Đã trang bị khung ảnh đại diện!'),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 1),
          ),
        );
      }

      await _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Trang bị thất bại: $e'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isActionRunning = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color darkBgColor = Color(0xFF0A0F0D);
    const Color darkCardColor = Color(0xFF131A16);
    const Color mintColor = Color(0xFF10B981);
    const Color textMutedColor = Color(0xFF94A3B8);

    return Scaffold(
      backgroundColor: darkBgColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: darkBgColor,
        elevation: 0,
        title: Text(
          "CỬA HÀNG KHUNG",
          style: GoogleFonts.quicksand(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: mintColor))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: mintColor,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // XP Balance Banner
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: darkCardColor,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: mintColor.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.bolt_rounded, color: Colors.amber, size: 24),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Số dư XP của bạn",
                                  style: TextStyle(color: textMutedColor, fontSize: 12),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  "$_userXp XP",
                                  style: GoogleFonts.quicksand(
                                    color: Colors.white,
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          OutlinedButton.icon(
                            onPressed: _isActionRunning
                                ? null
                                : () async {
                                    try {
                                      final ds = context.read<ProfileDataSource>();
                                      await ds.addXp(_userId, 500);
                                      await _loadData();
                                    } catch (_) {}
                                  },
                            icon: const Icon(Icons.add_circle_outline_rounded, size: 14),
                            label: const Text("Tặng 500 XP", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: mintColor,
                              side: const BorderSide(color: mintColor),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Title intro
                    const Text(
                      "Khung viền Avatar độc quyền",
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      "Tích lũy XP từ bài học để quy đổi các mẫu khung chuyển động và tĩnh cực ngầu dưới đây!",
                      style: TextStyle(color: textMutedColor, fontSize: 11, height: 1.3),
                    ),
                    const SizedBox(height: 20),

                    // Frames Grid
                    _frames.isEmpty
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.symmetric(vertical: 40),
                              child: Text("Không có khung ảnh nào khả dụng.", style: TextStyle(color: Colors.white30)),
                            ),
                          )
                        : GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 0.78,
                            ),
                            itemCount: _frames.length,
                            itemBuilder: (context, index) {
                              final frame = _frames[index];
                              final isOwned = _ownedFrameIds.contains(frame.id);
                              final isActive = _activeFrameId == frame.id;
                              final canAfford = _userXp >= frame.xpPrice;

                              return Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: darkCardColor,
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(
                                    color: isActive
                                        ? mintColor.withValues(alpha: 0.4)
                                        : Colors.white.withValues(alpha: 0.04),
                                    width: isActive ? 2 : 1,
                                  ),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    // Image with frame preview
                                    Expanded(
                                      child: Stack(
                                        alignment: Alignment.center,
                                        children: [
                                          // Dummy/Default User Avatar in center
                                          ClipOval(
                                            child: Image.network(
                                              "https://ui-avatars.com/api/?name=VSL&background=131A16&color=94a3b8&size=100",
                                              width: 58,
                                              height: 58,
                                              fit: BoxFit.cover,
                                            ),
                                          ),
                                          // Dynamic Frame Overlay on top
                                          Positioned.fill(
                                            child: Image.network(
                                              frame.fullImageUrl,
                                              fit: BoxFit.contain,
                                              errorBuilder: (ctx, err, stack) => const Icon(Icons.broken_image, color: Colors.white24),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 10),

                                    // Frame name & price info
                                    Text(
                                      frame.name,
                                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                      textAlign: TextAlign.center,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),

                                    if (!isOwned)
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(Icons.bolt_rounded, color: Colors.amber, size: 12),
                                          Text(
                                            "${frame.xpPrice} XP",
                                            style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      )
                                    else
                                      Text(
                                        isActive ? "Đang dùng" : "Đã sở hữu",
                                        style: TextStyle(color: isActive ? mintColor : textMutedColor, fontSize: 11, fontWeight: FontWeight.bold),
                                      ),
                                    const SizedBox(height: 10),

                                    // Buy or Equip action button
                                    SizedBox(
                                      width: double.infinity,
                                      child: _buildActionButton(
                                        isOwned: isOwned,
                                        isActive: isActive,
                                        canAfford: canAfford,
                                        frame: frame,
                                        mintColor: mintColor,
                                        cardColor: darkCardColor,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildActionButton({
    required bool isOwned,
    required bool isActive,
    required bool canAfford,
    required AvatarFrameModel frame,
    required Color mintColor,
    required Color cardColor,
  }) {
    if (isOwned) {
      if (isActive) {
        return ElevatedButton(
          onPressed: _isActionRunning ? null : () => _equipFrame(null),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white.withValues(alpha: 0.05),
            foregroundColor: Colors.redAccent,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(vertical: 8),
          ),
          child: const Text("Tháo", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
        );
      } else {
        return ElevatedButton(
          onPressed: _isActionRunning ? null : () => _equipFrame(frame.id),
          style: ElevatedButton.styleFrom(
            backgroundColor: mintColor.withValues(alpha: 0.15),
            foregroundColor: mintColor,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(vertical: 8),
          ),
          child: const Text("Trang bị", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
        );
      }
    } else {
      return ElevatedButton(
        onPressed: (_isActionRunning || !canAfford) ? null : () => _redeemFrame(frame),
        style: ElevatedButton.styleFrom(
          backgroundColor: canAfford ? Colors.amber : Colors.white.withValues(alpha: 0.03),
          foregroundColor: canAfford ? Colors.black : Colors.white30,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(vertical: 8),
        ),
        child: Text(
          canAfford ? "Mở khóa" : "Thiếu XP",
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
        ),
      );
    }
  }
}
