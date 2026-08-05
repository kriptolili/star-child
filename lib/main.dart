import 'package:flutter/material.dart';

import 'screens/welcome_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const ZodiacTalesApp());
}

class ZodiacTalesApp extends StatelessWidget {
  const ZodiacTalesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Zodiac Tales',
      theme: AppTheme.darkTheme,
      home: const WelcomeScreen(),
    );
  }
}
