import 'package:flutter/material.dart';

import '../models/child_profile.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'loading_screen.dart';

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({
    super.key,
    required this.profile,
  });

  final ChildProfile profile;

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  late String _selectedLanguage;
  late bool _voiceEnabled;
  late bool _musicEnabled;

  static const List<_LanguageOption> _languages = [
    _LanguageOption(
      value: 'auto',
      label: 'Otomatik Öner',
      subtitle: 'Doğum yerine göre uygun dil önerilir.',
      symbol: '🌍',
    ),
    _LanguageOption(
      value: 'tr',
      label: 'Türkçe',
      subtitle: 'Masal ve seslendirme Türkçe hazırlanır.',
      symbol: '🇹🇷',
    ),
    _LanguageOption(
      value: 'en',
      label: 'English',
      subtitle: 'Story and narration in English.',
      symbol: '🇺🇸',
    ),
    _LanguageOption(
      value: 'de',
      label: 'Deutsch',
      subtitle: 'Geschichte und Erzählung auf Deutsch.',
      symbol: '🇩🇪',
    ),
    _LanguageOption(
      value: 'fr',
      label: 'Français',
      subtitle: 'Histoire et narration en français.',
      symbol: '🇫🇷',
    ),
    _LanguageOption(
      value: 'es',
      label: 'Español',
      subtitle: 'Historia y narración en español.',
      symbol: '🇪🇸',
    ),
    _LanguageOption(
      value: 'pt',
      label: 'Português',
      subtitle: 'História e narração em português.',
      symbol: '🇧🇷',
    ),
    _LanguageOption(
      value: 'ar',
      label: 'العربية',
      subtitle: 'القصة والتعليق الصوتي باللغة العربية.',
      symbol: '🌙',
    ),
    _LanguageOption(
      value: 'hi',
      label: 'हिन्दी',
      subtitle: 'कहानी और आवाज़ हिन्दी में।',
      symbol: '🇮🇳',
    ),
    _LanguageOption(
      value: 'ja',
      label: '日本語',
      subtitle: '物語とナレーションを日本語で作成します。',
      symbol: '🇯🇵',
    ),
    _LanguageOption(
      value: 'ko',
      label: '한국어',
      subtitle: '이야기와 음성을 한국어로 만듭니다.',
      symbol: '🇰🇷',
    ),
    _LanguageOption(
      value: 'zh',
      label: '中文',
      subtitle: '故事和语音将使用中文制作。',
      symbol: '🇨🇳',
    ),
  ];

  @override
  void initState() {
    super.initState();

    _selectedLanguage = widget.profile.storyLanguage;
    _voiceEnabled = widget.profile.voiceEnabled;
    _musicEnabled = widget.profile.musicEnabled;
  }

  void _continue() {
    final updatedProfile = widget.profile.copyWith(
      storyLanguage: _selectedLanguage,
      voiceEnabled: _voiceEnabled,
      musicEnabled: _musicEnabled,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => LoadingScreen(
          profile: updatedProfile,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StarBackground(
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: AppColors.cream,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(28, 4, 28, 24),
                  child: Column(
                    children: [
                      const Text(
                        '✦',
                        style: TextStyle(
                          fontSize: 52,
                          color: AppColors.gold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Masal Dilini Seç',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.cream,
                          fontSize: 30,
                          height: 1.25,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '${widget.profile.name}’nın Yıldız Kitabı hangi dilde '
                        'yazılsın ve seslendirilsin?',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.lavender,
                          fontSize: 15,
                          height: 1.55,
                        ),
                      ),
                      const SizedBox(height: 26),

                      ..._languages.map(
                        (language) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _LanguageCard(
                            option: language,
                            selected:
                                _selectedLanguage == language.value,
                            onTap: () {
                              setState(() {
                                _selectedLanguage = language.value;
                              });
                            },
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
                      const Divider(
                        color: AppColors.fieldBorder,
                        height: 1,
                      ),
                      const SizedBox(height: 24),

                      const Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          '🎬 Video Deneyimi',
                          style: TextStyle(
                            color: AppColors.cream,
                            fontSize: 19,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      _SettingCard(
                        icon: Icons.record_voice_over_outlined,
                        title: 'Masalı Seslendir',
                        subtitle:
                            'Masal seçilen dilde, sıcak ve yumuşak '
                            'bir yapay zekâ sesiyle okunur.',
                        value: _voiceEnabled,
                        onChanged: (value) {
                          setState(() {
                            _voiceEnabled = value;
                          });
                        },
                      ),
                      const SizedBox(height: 12),

                      _SettingCard(
                        icon: Icons.music_note_outlined,
                        title: 'Hafif Arka Plan Müziği',
                        subtitle:
                            'Seslendirmeyi kapatmadan, çok hafif ve '
                            'sözsüz bir uyku müziği eşlik eder.',
                        value: _musicEnabled,
                        onChanged: (value) {
                          setState(() {
                            _musicEnabled = value;
                          });
                        },
                      ),

                      const SizedBox(height: 18),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(
                          color: AppColors.field,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: AppColors.fieldBorder,
                          ),
                        ),
                        child: const Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '💛',
                              style: TextStyle(fontSize: 18),
                            ),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Seslendirme yapay zekâ tarafından '
                                'oluşturulur. Masal dili daha sonra '
                                'yeniden seçilebilir.',
                                style: TextStyle(
                                  color: AppColors.lavender,
                                  fontSize: 13,
                                  height: 1.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 30),
                      PrimaryButton(
                        label: 'Yıldız Kitabını Hazırla',
                        onPressed: _continue,
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LanguageCard extends StatelessWidget {
  const _LanguageCard({
    required this.option,
    required this.selected,
    required this.onTap,
  });

  final _LanguageOption option;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 170),
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.field.withValues(alpha: 0.96)
                : AppColors.field.withValues(alpha: 0.65),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected
                  ? AppColors.gold
                  : AppColors.fieldBorder,
              width: selected ? 1.6 : 1,
            ),
          ),
          child: Row(
            children: [
              Text(
                option.symbol,
                style: const TextStyle(fontSize: 27),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      option.label,
                      style: const TextStyle(
                        color: AppColors.cream,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      option.subtitle,
                      style: const TextStyle(
                        color: AppColors.lavender,
                        fontSize: 12.5,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Icon(
                selected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_off,
                color: selected
                    ? AppColors.gold
                    : AppColors.lavender,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SettingCard extends StatelessWidget {
  const _SettingCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 14, 10, 14),
      decoration: BoxDecoration(
        color: AppColors.field,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: value
              ? AppColors.gold
              : AppColors.fieldBorder,
          width: value ? 1.4 : 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: value
                ? AppColors.gold
                : AppColors.lavender,
            size: 27,
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.cream,
                    fontSize: 15.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.lavender,
                    fontSize: 12.5,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppColors.gold,
            activeTrackColor:
                AppColors.gold.withValues(alpha: 0.35),
          ),
        ],
      ),
    );
  }
}

class _LanguageOption {
  const _LanguageOption({
    required this.value,
    required this.label,
    required this.subtitle,
    required this.symbol,
  });

  final String value;
  final String label;
  final String subtitle;
  final String symbol;
}