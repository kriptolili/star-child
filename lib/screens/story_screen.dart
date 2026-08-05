import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/child_profile.dart';
import '../models/story_result.dart';
import '../services/story_api_service.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'welcome_screen.dart';

class StoryScreen extends StatefulWidget {
  const StoryScreen({
    super.key,
    required this.profile,
    required this.result,
  });

  final ChildProfile profile;
  final StoryResult result;

  @override
  State<StoryScreen> createState() => _StoryScreenState();
}

class _StoryScreenState extends State<StoryScreen> {
  final StoryApiService _storyApiService = StoryApiService();

  StarPackageResult? _packageResult;

  bool _isPreparingPackage = false;
  String? _packageError;

  ChildProfile get profile => widget.profile;
  StoryResult get result => widget.result;

  Future<void> _preparePackage() async {
    if (_isPreparingPackage) return;

    setState(() {
      _isPreparingPackage = true;
      _packageError = null;
    });

    try {
      final packageResult =
          await _storyApiService.createPackage(
        profile: profile,
        storyJson: result.toJson(),
      );

      if (!mounted) return;

      setState(() {
        _packageResult = packageResult;
        _isPreparingPackage = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Your Star Package is Ready! ✨',
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;

      setState(() {
        _isPreparingPackage = false;
        _packageError = _cleanError(error);
      });
    }
  }

  String _cleanError(Object error) {
    return error
        .toString()
        .replaceFirst('Exception: ', '')
        .trim();
  }

  Future<void> _openUrl(
    String? url, {
    required String unavailableMessage,
  }) async {
    if (url == null || url.trim().isEmpty) {
      _showMessage(unavailableMessage);
      return;
    }

    final uri = Uri.tryParse(url.trim());

    if (uri == null) {
      _showMessage(
        'Dosya bağlantısı geçerli değil.',
      );
      return;
    }

    try {
      final opened = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );

      if (!opened && mounted) {
        _showMessage(
          'Unable to open the file. Please try again.',
        );
      }
    } catch (_) {
      if (!mounted) return;

      _showMessage(
        'Something went wrong while opening the file.',
      );
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
      ),
    );
  }

  void _startNewStory() {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (_) => const WelcomeScreen(),
      ),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final packageResult = _packageResult;

    return Scaffold(
      body: StarBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(
              24,
              18,
              24,
              34,
            ),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton(
                    onPressed: () =>
                        Navigator.pop(context),
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: AppColors.cream,
                    ),
                  ),
                ),

                const Text(
                  '✦',
                  style: TextStyle(
                    fontSize: 58,
                    color: AppColors.gold,
                  ),
                ),

                const SizedBox(height: 12),

                Text(
                  profile.name.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.lavender,
                    fontSize: 13,
                    letterSpacing: 3,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                const SizedBox(height: 16),

                Text(
                  result.title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.cream,
                    fontSize: 30,
                    height: 1.3,
                    fontWeight: FontWeight.w600,
                  ),
                ),

                const SizedBox(height: 24),

                _StoryCard(
                  label: 'GUARDIAN STAR',
                  child: Column(
                    children: [
                      Text(
                        result.guardianStar,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.gold,
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        result.guardianStarMeaning,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.lavender,
                          fontSize: 16,
                          height: 1.55,
                        ),
                      ),
                    ],
                  ),
                ),

                _StoryCard(
                  label:
                      'CREATED ESPECIALLY FOR ${profile.name.toUpperCase()}',
                  child: Text(
                    result.openingNote,
                    style: const TextStyle(
                      color: AppColors.cream,
                      fontSize: 17,
                      height: 1.7,
                    ),
                  ),
                ),

                _StoryCard(
                  label: 'STAR STORY',
                  child: Text(
                    result.story,
                    style: const TextStyle(
                      color: AppColors.cream,
                      fontSize: 17,
                      height: 1.75,
                    ),
                  ),
                ),

                _StoryCard(
                  label: 'LULLABY',
                  child: Text(
                    result.lullaby,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.cream,
                      fontSize: 17,
                      height: 1.8,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),

                _StoryCard(
                  label:
                      '${result.guardianStar.toUpperCase()} WHISPERS',
                  child: Text(
                    result.starMessage,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.gold,
                      fontSize: 17,
                      height: 1.65,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),

                const SizedBox(height: 8),

                _PackageSection(
                  isPreparing: _isPreparingPackage,
                  packageResult: packageResult,
                  errorMessage: _packageError,
                  illustrationCount:
                      result.illustrations.length,
                  onPrepare: _preparePackage,
                  onOpenPdf: () => _openUrl(
                    packageResult?.pdfUrl,
                    unavailableMessage:
                        'Your narration is not ready yet.',
                  ),
                  onOpenAudio: () => _openUrl(
                    packageResult?.audioUrl,
                    unavailableMessage:
                        'Your narration is not ready yet.',
                  ),
                  onOpenVideo: () => _openUrl(
                    packageResult?.videoUrl,
                    unavailableMessage:
                        'Your story video is not ready yet.',
                  ),
                ),

                const SizedBox(height: 18),

                PrimaryButton(
                  label: 'Create Another Story',
                  onPressed: _isPreparingPackage
                      ? null
                      : _startNewStory,
                ),

                const SizedBox(height: 14),

                const Text(
                  'Narration is AI-generated. '
                  'Your child\'s information is used only '
                  'to create a personalized storytelling experience.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.muted,
                    fontSize: 12,
                    height: 1.5,
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

class _PackageSection extends StatelessWidget {
  const _PackageSection({
    required this.isPreparing,
    required this.packageResult,
    required this.errorMessage,
    required this.illustrationCount,
    required this.onPrepare,
    required this.onOpenPdf,
    required this.onOpenAudio,
    required this.onOpenVideo,
  });

  final bool isPreparing;
  final StarPackageResult? packageResult;
  final String? errorMessage;
  final int illustrationCount;

  final VoidCallback onPrepare;
  final VoidCallback onOpenPdf;
  final VoidCallback onOpenAudio;
  final VoidCallback onOpenVideo;

  bool get isReady => packageResult != null;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.field.withValues(
          alpha: 0.9,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isReady
              ? AppColors.gold
              : AppColors.fieldBorder,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x22000000),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          const Icon(
            Icons.auto_stories_rounded,
            color: AppColors.gold,
            size: 44,
          ),

          const SizedBox(height: 12),

          Text(
            isReady
                ? 'Yıldız Paketini Hazırla'
                : 'Your Star Package is Ready',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.cream,
              fontSize: 23,
              height: 1.3,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 10),

          Text(
            isReady
                ? '${packageResult!.imageUrls.length} resimli sayfa, '
                    'illustrated pages, storybook and narration are ready.'
                : '$illustrationCount resimli sayfa, PDF kitap '
                    've sıcak seslendirme hazırlanacak.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.lavender,
              fontSize: 14,
              height: 1.55,
            ),
          ),

          if (errorMessage != null &&
              errorMessage!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0x33B55C6C),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: const Color(0x66D98898),
                ),
              ),
              child: Text(
                errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.cream,
                  fontSize: 13,
                  height: 1.45,
                ),
              ),
            ),
          ],

          const SizedBox(height: 20),

          if (!isReady)
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed:
                    isPreparing ? null : onPrepare,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: AppColors.darkText,
                  disabledBackgroundColor: AppColors.fieldBorder,
                  padding: const EdgeInsets.symmetric(
                    vertical: 17,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: isPreparing
                    ? const Row(
                        mainAxisAlignment:
                            MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 21,
                            height: 21,
                            child:
                                CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: AppColors.cream,
                            ),
                          ),
                          SizedBox(width: 12),
                          Flexible(
                            child: Text(
                              'illustrated pages, premium storybook, narration and video will be created.',
                              textAlign:
                                  TextAlign.center,
                            ),
                          ),
                        ],
                      )
                    : const Text(
                        'Prepare Star Package',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
              ),
            )
          else ...[
            _PackageButton(
              icon: Icons.menu_book_rounded,
              label: 'Open Storybook',
              enabled: packageResult!.hasPdf,
              onPressed: onOpenPdf,
            ),

            const SizedBox(height: 11),

            _PackageButton(
              icon: Icons.headphones_rounded,
              label: 'Listen to Story',
              enabled: packageResult!.hasAudio,
              onPressed: onOpenAudio,
            ),

            const SizedBox(height: 11),

            _PackageButton(
              icon: Icons.play_circle_fill_rounded,
              label: 'Watch Story Video',
              enabled: packageResult!.hasVideo,
              onPressed: onOpenVideo,
              helperText: packageResult!.hasVideo
                  ? null
                  : 'Video is being prepared...',
            ),
          ],

          if (isReady &&
              packageResult!.disclosure != null &&
              packageResult!
                  .disclosure!
                  .trim()
                  .isNotEmpty) ...[
            const SizedBox(height: 15),
            Text(
              packageResult!.disclosure!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.muted,
                fontSize: 11,
                height: 1.45,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PackageButton extends StatelessWidget {
  const _PackageButton({
    required this.icon,
    required this.label,
    required this.enabled,
    required this.onPressed,
    this.helperText,
  });

  final IconData icon;
  final String label;
  final bool enabled;
  final VoidCallback onPressed;
  final String? helperText;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: enabled ? onPressed : null,
            icon: Icon(icon),
            label: Text(label),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.cream,
              disabledForegroundColor:
                  AppColors.muted,
              padding: const EdgeInsets.symmetric(
                vertical: 16,
                horizontal: 16,
              ),
              side: BorderSide(
                color: enabled
                    ? AppColors.gold
                    : AppColors.fieldBorder,
              ),
              shape: RoundedRectangleBorder(
                borderRadius:
                    BorderRadius.circular(16),
              ),
              textStyle: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
        if (helperText != null) ...[
          const SizedBox(height: 6),
          Text(
            helperText!,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 11,
              height: 1.4,
            ),
          ),
        ],
      ],
    );
  }
}

class _StoryCard extends StatelessWidget {
  const _StoryCard({
    required this.label,
    required this.child,
  });

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.field.withValues(
          alpha: 0.82,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.fieldBorder,
        ),
      ),
      child: Column(
        children: [
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.lavender,
              fontSize: 11,
              letterSpacing: 1.8,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}