import 'dart:io';

import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../models/child_profile.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'language_screen.dart';

class AppearanceScreen extends StatefulWidget {
  const AppearanceScreen({
    super.key,
    required this.profile,
  });

  final ChildProfile profile;

  @override
  State<AppearanceScreen> createState() => _AppearanceScreenState();
}

class _AppearanceScreenState extends State<AppearanceScreen> {
  final ImagePicker _imagePicker = ImagePicker();

  late String _appearanceMode;
  late String _appearanceRegion;
  String? _photoPath;
  bool _isPickingPhoto = false;

  static const List<_RegionOption> _regions = [
    _RegionOption(
      value: 'east_asia',
      label: 'Doğu Asya',
      emoji: '🌸',
    ),
    _RegionOption(
      value: 'south_asia',
      label: 'Güney Asya',
      emoji: '🪷',
    ),
    _RegionOption(
      value: 'africa',
      label: 'Afrika',
      emoji: '🌍',
    ),
    _RegionOption(
      value: 'europe',
      label: 'Avrupa',
      emoji: '🏰',
    ),
    _RegionOption(
      value: 'middle_east',
      label: 'Orta Doğu',
      emoji: '🌿',
    ),
    _RegionOption(
      value: 'latin_america',
      label: 'Latin Amerika',
      emoji: '🌺',
    ),
    _RegionOption(
      value: 'mixed',
      label: 'Karışık / Evrensel',
      emoji: '🌈',
    ),
  ];

  @override
  void initState() {
    super.initState();

    _appearanceMode = widget.profile.appearanceMode;
    _appearanceRegion = widget.profile.appearanceRegion;
    _photoPath = widget.profile.photoPath;
  }

  bool get _canContinue {
    if (_appearanceMode == 'auto') return true;

    return _appearanceRegion != 'auto';
  }

  Future<void> _pickPhoto() async {
    if (_isPickingPhoto) return;

    setState(() {
      _isPickingPhoto = true;
    });

    try {
      final selectedImage = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 88,
        maxWidth: 1600,
        maxHeight: 1600,
      );

      if (!mounted || selectedImage == null) return;

      setState(() {
        _photoPath = selectedImage.path;
      });
    } catch (_) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Fotoğraf seçilemedi. Lütfen yeniden deneyin.'),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isPickingPhoto = false;
        });
      }
    }
  }

  void _removePhoto() {
    setState(() {
      _photoPath = null;
    });
  }

  void _continue() {
    if (!_canContinue) return;

    final updatedProfile = widget.profile.copyWith(
      appearanceMode: _appearanceMode,
      appearanceRegion:
          _appearanceMode == 'auto' ? 'auto' : _appearanceRegion,
      photoPath: _photoPath,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => LanguageScreen(
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
                  padding: const EdgeInsets.fromLTRB(28, 6, 28, 22),
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
                        'Masaldaki Kahramanın Görünümü',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.cream,
                          fontSize: 29,
                          height: 1.25,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Masaldaki kahramanın '
                        '${widget.profile.name}’ya benzemesini ister misiniz?',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.lavender,
                          fontSize: 15,
                          height: 1.55,
                        ),
                      ),
                      const SizedBox(height: 28),

                      _ChoiceCard(
                        selected: _appearanceMode == 'auto',
                        icon: '🌍',
                        title: 'Doğduğu bölgeden ilham alsın',
                        subtitle:
                            'Kahramanın görünümü doğum yerinden ve '
                            'Star Child hayal dünyasından ilham alır.',
                        onTap: () {
                          setState(() {
                            _appearanceMode = 'auto';
                            _appearanceRegion = 'auto';
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      _ChoiceCard(
                        selected: _appearanceMode == 'custom',
                        icon: '🎨',
                        title: 'Ben seçmek istiyorum',
                        subtitle:
                            'Kahramanın görünümüne ilham verecek '
                            'bölgeyi siz seçin.',
                        onTap: () {
                          setState(() {
                            _appearanceMode = 'custom';

                            if (_appearanceRegion == 'auto') {
                              _appearanceRegion = 'mixed';
                            }
                          });
                        },
                      ),

                      if (_appearanceMode == 'custom') ...[
                        const SizedBox(height: 26),
                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            'Görünümüne ilham verecek bölge',
                            style: TextStyle(
                              color: AppColors.cream,
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: _regions.map((region) {
                            final selected =
                                _appearanceRegion == region.value;

                            return _RegionChip(
                              option: region,
                              selected: selected,
                              onTap: () {
                                setState(() {
                                  _appearanceRegion = region.value;
                                });
                              },
                            );
                          }).toList(),
                        ),
                      ],

                      const SizedBox(height: 32),
                      const Divider(
                        color: AppColors.fieldBorder,
                        height: 1,
                      ),
                      const SizedBox(height: 28),

                      const Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          '📷 Fotoğraf Ekle',
                          style: TextStyle(
                            color: AppColors.cream,
                            fontSize: 19,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 5),
                      const Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          'İsteğe bağlı',
                          style: TextStyle(
                            color: AppColors.gold,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Fotoğraf yalnızca masaldaki kahramanın '
                        'görünümüne ilham vermek için kullanılır. '
                        'Kahraman, sıcak bir çocuk kitabı üslubuyla '
                        'yeniden yorumlanır.',
                        style: TextStyle(
                          color: AppColors.lavender,
                          fontSize: 14,
                          height: 1.55,
                        ),
                      ),
                      const SizedBox(height: 18),

                      if (_photoPath == null)
                        _PhotoPicker(
                          loading: _isPickingPhoto,
                          onTap: _pickPhoto,
                        )
                      else
                        _SelectedPhoto(
                          photoPath: _photoPath!,
                          onChange: _pickPhoto,
                          onRemove: _removePhoto,
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
                                'Kitabın bütün sayfalarında aynı çocuk, '
                                'aynı yüz, aynı saç ve aynı kıyafet '
                                'paleti korunacaktır.',
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
                        label: 'Masal Dilini Seç',
                        onPressed: _canContinue ? _continue : null,
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

class _ChoiceCard extends StatelessWidget {
  const _ChoiceCard({
    required this.selected,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final bool selected;
  final String icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(17),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          width: double.infinity,
          padding: const EdgeInsets.all(17),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.field.withValues(alpha: 0.96)
                : AppColors.field.withValues(alpha: 0.65),
            borderRadius: BorderRadius.circular(17),
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
                icon,
                style: const TextStyle(fontSize: 29),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: AppColors.cream,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: AppColors.lavender,
                        fontSize: 13,
                        height: 1.4,
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

class _RegionChip extends StatelessWidget {
  const _RegionChip({
    required this.option,
    required this.selected,
    required this.onTap,
  });

  final _RegionOption option;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 11,
          ),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.gold.withValues(alpha: 0.16)
                : AppColors.field,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: selected
                  ? AppColors.gold
                  : AppColors.fieldBorder,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Text(
            '${option.emoji}  ${option.label}',
            style: TextStyle(
              color: selected
                  ? AppColors.cream
                  : AppColors.lavender,
              fontSize: 13,
              fontWeight:
                  selected ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}

class _PhotoPicker extends StatelessWidget {
  const _PhotoPicker({
    required this.loading,
    required this.onTap,
  });

  final bool loading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return DottedBorder(
      color: AppColors.fieldBorder,
      strokeWidth: 1.3,
      dashPattern: const [8, 6],
      borderType: BorderType.RRect,
      radius: const Radius.circular(18),
      child: InkWell(
        onTap: loading ? null : onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 26,
          ),
          child: Column(
            children: [
              if (loading)
                const SizedBox(
                  width: 30,
                  height: 30,
                  child: CircularProgressIndicator(
                    color: AppColors.gold,
                    strokeWidth: 2.5,
                  ),
                )
              else
                const Icon(
                  Icons.add_photo_alternate_outlined,
                  color: AppColors.gold,
                  size: 38,
                ),
              const SizedBox(height: 12),
              Text(
                loading
                    ? 'Fotoğraf hazırlanıyor...'
                    : 'Galeriden Fotoğraf Seç',
                style: const TextStyle(
                  color: AppColors.cream,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SelectedPhoto extends StatelessWidget {
  const _SelectedPhoto({
    required this.photoPath,
    required this.onChange,
    required this.onRemove,
  });

  final String photoPath;
  final VoidCallback onChange;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final imageFile = File(photoPath);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.field,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.gold,
          width: 1.3,
        ),
      ),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Image.file(
              imageFile,
              width: double.infinity,
              height: 220,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) {
                return const SizedBox(
                  height: 160,
                  child: Center(
                    child: Text(
                      'Fotoğraf görüntülenemedi.',
                      style: TextStyle(
                        color: AppColors.lavender,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onChange,
                  icon: const Icon(
                    Icons.swap_horiz,
                    size: 18,
                  ),
                  label: const Text('Değiştir'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.cream,
                    side: const BorderSide(
                      color: AppColors.fieldBorder,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onRemove,
                  icon: const Icon(
                    Icons.delete_outline,
                    size: 18,
                  ),
                  label: const Text('Kaldır'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.lavender,
                    side: const BorderSide(
                      color: AppColors.fieldBorder,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RegionOption {
  const _RegionOption({
    required this.value,
    required this.label,
    required this.emoji,
  });

  final String value;
  final String label;
  final String emoji;
}