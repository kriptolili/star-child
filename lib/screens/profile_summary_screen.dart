import 'package:flutter/material.dart';

import '../models/child_profile.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'loading_screen.dart';
import 'welcome_screen.dart';

class ProfileSummaryScreen extends StatelessWidget {
  const ProfileSummaryScreen({
    super.key,
    required this.profile,
  });

  final ChildProfile profile;

  String get _dateText {
    final value = profile.birthDate;
    if (value == null) return '-';

    return '${value.day.toString().padLeft(2, '0')}.'
        '${value.month.toString().padLeft(2, '0')}.'
        '${value.year}';
  }

  String get _timeText {
    final value = profile.birthTime;
    if (value == null) return '-';

    return '${value.hour.toString().padLeft(2, '0')}:'
        '${value.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StarBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 28,
              vertical: 28,
            ),
            child: Column(
              children: [
                const Spacer(),

                const Text(
                  '✦',
                  style: TextStyle(
                    fontSize: 62,
                    color: AppColors.gold,
                  ),
                ),

                const SizedBox(height: 20),

                Text(
                  '${profile.name}’nın yıldız kapısı hazır.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.cream,
                    fontSize: 30,
                    height: 1.3,
                    fontWeight: FontWeight.w600,
                  ),
                ),

                const SizedBox(height: 14),

                const Text(
                  'Bilgileri kontrol et. Ardından koruyucu yıldızı '
                  've yalnızca ona ait masalı doğsun.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.lavender,
                    fontSize: 16,
                    height: 1.6,
                  ),
                ),

                const SizedBox(height: 28),

                _InfoRow(
                  label: 'Ad',
                  value: profile.name,
                ),
                _InfoRow(
                  label: 'Doğum tarihi',
                  value: _dateText,
                ),
                _InfoRow(
                  label: 'Doğum saati',
                  value: _timeText,
                ),
                _InfoRow(
                  label: 'Doğum yeri',
                  value: profile.birthPlace,
                ),

                const Spacer(),

                PrimaryButton(
                  label: 'Masalı ve Yıldızını Oluştur',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => LoadingScreen(
                          profile: profile,
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 10),

                TextButton(
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const WelcomeScreen(),
                      ),
                      (_) => false,
                    );
                  },
                  child: const Text(
                    'Başa Dön',
                    style: TextStyle(
                      color: AppColors.lavender,
                    ),
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

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(
        horizontal: 18,
        vertical: 14,
      ),
      decoration: BoxDecoration(
        color: AppColors.field,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.fieldBorder,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.lavender,
              ),
            ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: AppColors.cream,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}