import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/datasources/course_data_source.dart';

class CourseImageWidget extends StatefulWidget {
  final int? coverMediaId;
  final String title;
  final double size;

  const CourseImageWidget({
    super.key,
    required this.coverMediaId,
    required this.title,
    required this.size,
  });

  @override
  State<CourseImageWidget> createState() => _CourseImageWidgetState();
}

class _CourseImageWidgetState extends State<CourseImageWidget> {
  String? _url;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.coverMediaId != null) {
      _loadUrl();
    }
  }

  @override
  void didUpdateWidget(covariant CourseImageWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.coverMediaId != oldWidget.coverMediaId) {
      _loadUrl();
    }
  }

  Future<void> _loadUrl() async {
    if (widget.coverMediaId == null) return;
    setState(() {
      _isLoading = true;
    });
    try {
      final ds = context.read<CourseDataSource>();
      final fileUrl = await ds.getVideoUrl(widget.coverMediaId!);
      if (mounted) {
        setState(() {
          _url = fileUrl;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final defaultUrl = "https://ui-avatars.com/api/?name=${Uri.encodeComponent(widget.title)}&background=10b981&color=fff&size=200";
    
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: SizedBox(
        width: widget.size,
        height: widget.size,
        child: _isLoading 
            ? const Center(child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF10B981))))
            : Image.network(
                _url ?? defaultUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Image.network(defaultUrl, fit: BoxFit.cover),
              ),
      ),
    );
  }
}
