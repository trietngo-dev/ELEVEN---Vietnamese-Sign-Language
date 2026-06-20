import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand colors from Google Stitch
  static const Color primaryColor = Color(0xFF4EDEA3); // Emerald main
  static const Color primaryContainer = Color(0xFF10B981); // Solid green buttons
  static const Color onPrimaryContainer = Color(0xFF00422B);
  static const Color secondaryColor = Color(0xFFADC6FF); // Soft blue accent
  
  static const Color backgroundColor = Color(0xFF0E1511); // Dark forest background
  static const Color onBackgroundColor = Color(0xFFDDE4DD); // Bright text
  
  static const Color surfaceColor = Color(0xFF161D19); // Surface low
  static const Color surfaceContainer = Color(0xFF1A211D); // Surface medium
  static const Color surfaceContainerHigh = Color(0xFF242C27); // Surface high
  static const Color surfaceContainerHighest = Color(0xFF2F3632); // Surface highest
  
  static const Color onSurfaceVariant = Color(0xFFBBCABF); // Subtitle/description text
  static const Color outlineVariant = Color(0xFF3C4A42);
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: backgroundColor,
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        primaryContainer: primaryContainer,
        onPrimaryContainer: onPrimaryContainer,
        secondary: secondaryColor,
        surface: surfaceColor,
        error: Color(0xFFE46C6C),
      ),
      textTheme: GoogleFonts.beVietnamProTextTheme().copyWith(
        displayLarge: GoogleFonts.beVietnamPro(
          fontSize: 40,
          fontWeight: FontWeight.bold,
          color: onBackgroundColor,
          letterSpacing: -0.8,
        ),
        headlineLarge: GoogleFonts.beVietnamPro(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: onBackgroundColor,
          letterSpacing: -0.3,
        ),
        headlineMedium: GoogleFonts.beVietnamPro(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: onBackgroundColor,
        ),
        bodyLarge: GoogleFonts.beVietnamPro(
          fontSize: 18,
          fontWeight: FontWeight.normal,
          color: onBackgroundColor,
        ),
        bodyMedium: GoogleFonts.beVietnamPro(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: onSurfaceVariant,
        ),
        labelLarge: GoogleFonts.beVietnamPro(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: onBackgroundColor,
          letterSpacing: 0.7,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1A211D).withOpacity(0.6),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        prefixIconColor: onSurfaceVariant,
        suffixIconColor: onSurfaceVariant,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.1), width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.1), width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: const BorderSide(color: primaryColor, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: const BorderSide(color: Color(0xFFE46C6C), width: 1.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: const BorderSide(color: Color(0xFFE46C6C), width: 1.5),
        ),
        labelStyle: GoogleFonts.beVietnamPro(
          color: onSurfaceVariant,
          fontWeight: FontWeight.w500,
          fontSize: 14,
        ),
        hintStyle: GoogleFonts.beVietnamPro(
          color: onSurfaceVariant.withOpacity(0.5),
          fontWeight: FontWeight.normal,
          fontSize: 14,
        ),
      ),
    );
  }

  // Helper Widget for glassmorphism styling
  static Widget glassPanel({
    required Widget child,
    EdgeInsetsGeometry? padding,
    double borderRadius = 16.0,
    double blur = 16.0,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: Colors.white.withOpacity(0.1),
              width: 1.0,
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}
