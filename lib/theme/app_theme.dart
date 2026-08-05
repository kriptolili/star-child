import 'package:flutter/material.dart';

import 'app_colors.dart';

abstract final class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.backgroundBottom,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.gold,
        secondary: AppColors.lavender,
        surface: AppColors.field,
      ),
      datePickerTheme: const DatePickerThemeData(
        backgroundColor: AppColors.backgroundMiddle,
        headerBackgroundColor: AppColors.field,
        headerForegroundColor: AppColors.cream,
      ),
      timePickerTheme: const TimePickerThemeData(
        backgroundColor: AppColors.backgroundMiddle,
        dialBackgroundColor: AppColors.field,
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          color: AppColors.cream,
          fontSize: 30,
          height: 1.3,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          color: AppColors.lavender,
          fontSize: 16,
          height: 1.6,
        ),
      ),
    );
  }
}
