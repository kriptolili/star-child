import 'package:flutter/material.dart';

import '../models/child_profile.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'child_name_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StarBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 28,
              vertical: 32,
            ),
            child: Column(
              children: [
                const Spacer(),

                const Text(
                  '✦',
                  style: TextStyle(
                    fontSize: 58,
                    color: AppColors.gold,
                  ),
                ),

                const SizedBox(height: 18),

                const Text(
                  'ZODIAC TALES',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    letterSpacing: 4,
                    fontWeight: FontWeight.w600,
                    color: AppColors.lavender,
                  ),
                ),

                const SizedBox(height: 22),

                const Text(
                  'Her çocuk, gökyüzünün bir daha asla '
                  'tekrarlanmayacak bir anında dünyaya gelir.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 30,
                    height: 1.28,
                    fontWeight: FontWeight.w600,
                    color: AppColors.cream,
                  ),
                ),

                const SizedBox(height: 22),

                const Text(
                  'Biz o anı yalnızca hesaplamıyoruz. '
                  'Onu bir ömür saklanacak bir hatıraya dönüştürüyoruz.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    height: 1.65,
                    color: AppColors.lavender,
                  ),
                ),

                const Spacer(),

                PrimaryButton(
                  label: 'Hikâyeni Başlat',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const ChildNameScreen(
                          profile: ChildProfile(),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 16),

                const Text(
                  'Masal • Video • Hatıra PDF',
                  style: TextStyle(
                    fontSize: 13,
                    letterSpacing: 1,
                    color: AppColors.muted,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}