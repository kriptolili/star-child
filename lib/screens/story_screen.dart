import 'dart:async';

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

  // Video, paketten ayrı bir arka plan görevi olarak çalıştığı için
  // hazır olana kadar bu Timer ile periyodik olarak sorgulanır.
  Timer? _videoStatusTimer;
  bool _isCheckingVideoStatus = false;

  // Boyama kitabı, paket hazır olduktan sonra ayrı bir istekle
  // (talep üzerine) hazırlanır.
  bool _isPreparingColoringBook = false;
  String? _coloringBookUrl;
  String? _coloringBookError;

  ChildProfile get profile => widget.profile;
  StoryResult get result => widget.result;

  @override
  void dispose() {
    // Ekran kapanınca sorgulama mutlaka durdurulmalı, yoksa
    // artık var olmayan bir widget üzerinde setState çağrılır.
    _videoStatusTimer?.cancel();
    super.dispose();
  }

  Future<void> _preparePackage() async {
    if (_isPreparingPackage) return;

    // Önceki paketten kalmış olabilecek bir video sorgulamasını
    // durdur, yeni paket için sıfırdan başlayacağız.
    _videoStatusTimer?.cancel();

    setState(() {
      _isPreparingPackage = true;
      _packageResult = null;
      _packageError = null;
      _coloringBookUrl = null;
      _coloringBookError = null;
    });

    try {
      final packageResult = await _storyApiService.createPackage(
        profile: profile,
        storyJson: result.toJson(),
      );

      if (!mounted) return;

      setState(() {
        _packageResult = packageResult;
        _packageError = null;
        _isPreparingPackage = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            packageResult.message.trim().isNotEmpty
                ? packageResult.message
                : 'Your Star Package is Ready! ✨',
          ),
        ),
      );

      // PDF ve ses hazır; video hâlâ arka planda hazırlanıyorsa
      // durumunu periyodik olarak sorgulamaya başla.
      if (packageResult.isVideoProcessing &&
          packageResult.videoJobId != null) {
        _startVideoStatusPolling(packageResult.videoJobId!);
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _packageResult = null;
        _packageError = _cleanError(error);
        _isPreparingPackage = false;
      });
    }
  }

  void _startVideoStatusPolling(String jobId) {
    _videoStatusTimer?.cancel();

    // İlk kontrolü biraz bekleterek başlat; video render'ı
    // genelde birkaç saniyeden önce ilerleme kaydetmiyor.
    _videoStatusTimer = Timer.periodic(
      const Duration(seconds: 18),
      (_) => _checkVideoStatus(jobId),
    );
  }

  Future<void> _checkVideoStatus(String jobId) async {
    if (_isCheckingVideoStatus || !mounted) return;

    _isCheckingVideoStatus = true;
    try {
      final videoStatus = await _storyApiService.getVideoStatus(jobId);

      if (!mounted) return;

      final currentPackage = _packageResult;
      if (currentPackage == null) return;

      setState(() {
        _packageResult = currentPackage.copyWithVideo(
          videoUrl: videoStatus.videoUrl,
          videoStatus: videoStatus.status,
          videoProgress: videoStatus.progress,
        );
      });

      if (videoStatus.isReady || videoStatus.isFailed) {
        _videoStatusTimer?.cancel();
      }
    } catch (_) {
      // Ağ hatası tek seferlik olabilir; bir sonraki periyotta
      // tekrar denenecek, kullanıcıyı rahatsız etmeye gerek yok.
    } finally {
      _isCheckingVideoStatus = false;
    }
  }

  String _cleanError(Object error) {
    return error.toString().replaceFirst('Exception: ', '').trim();
  }

  Future<void> _prepareColoringBook() async {
    if (_isPreparingColoringBook) return;

    setState(() {
      _isPreparingColoringBook = true;
      _coloringBookError = null;
    });

    try {
      // NOT: 'result' burada widget.result getter'ını (StoryResult)
      // ifade eder; API'den dönen yanıtı farklı bir isimle
      // (coloringBookResult) tutuyoruz ki bu getter'ın gölgelenmesini
      // (shadowing) önleyelim.
      final coloringBookResult = await _storyApiService
          .createColoringBook(
        profile: profile,
        storyJson: result.toJson(),
      );

      if (!mounted) return;

      setState(() {
        _coloringBookUrl = coloringBookResult.coloringBookUrl;
        _isPreparingColoringBook = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _coloringBookError = _cleanError(error);
        _isPreparingColoringBook = false;
      });
    }
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
      _showMessage('Dosya bağlantısı geçerli değil.');
      return;
    }

    try {
      final opened = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!opened && mounted) {
        _showMessage('Unable to open the file. Please try again.');
      }
    } catch (_) {
      if (!mounted) return;
      _showMessage('Something went wrong while opening the file.');
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
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
            padding: const EdgeInsets.fromLTRB(24, 18, 24, 34),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton(
                    onPressed: _isPreparingPackage
                        ? null
                        : () => Navigator.pop(context),
                    icon: Icon(
                      Icons.arrow_back_ios_new,
                      color: _isPreparingPackage
                          ? AppColors.muted
                          : AppColors.cream,
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
                  label: '${result.guardianStar.toUpperCase()} WHISPERS',
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
                  illustrationCount: result.illustrations.length,
                  onPrepare: _preparePackage,
                  onOpenPdf: () => _openUrl(
                    packageResult?.pdfUrl,
                    unavailableMessage: 'Your storybook is not ready yet.',
                  ),
                  onOpenAudio: () => _openUrl(
                    packageResult?.audioUrl,
                    unavailableMessage: 'Your narration is not ready yet.',
                  ),
                  onOpenVideo: () => _openUrl(
                    packageResult?.videoUrl,
                    unavailableMessage: 'Your story video is not ready yet.',
                  ),
                ),
                if (packageResult != null &&
                    packageResult.hasImages) ...[
                  const SizedBox(height: 18),
                  _ColoringBookSection(
                    isPreparing: _isPreparingColoringBook,
                    coloringBookUrl: _coloringBookUrl,
                    errorMessage: _coloringBookError,
                    onPrepare: _prepareColoringBook,
                    onOpen: () => _openUrl(
                      _coloringBookUrl,
                      unavailableMessage:
                          'Your coloring book is not ready yet.',
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                PrimaryButton(
                  label: 'Create Another Story',
                  onPressed:
                      _isPreparingPackage ? null : _startNewStory,
                ),
                const SizedBox(height: 14),
                const Text(
                  'Narration is AI-generated. '
                  "Your child's information is used only "
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
  bool get hasError =>
      errorMessage != null && errorMessage!.trim().isNotEmpty;

  String get title {
    if (isPreparing) {
      return 'Your Star Package is Being Prepared';
    }
    if (isReady) {
      return 'Your Star Package is Ready ✨';
    }
    if (hasError) {
      return 'Your Star Package Could Not Be Prepared';
    }
    return 'Prepare Your Star Package';
  }

  String get description {
    if (isPreparing) {
      return '$illustrationCount illustrated pages, '
          'storybook and narration are being prepared. '
          'Please keep this page open.';
    }
    if (isReady) {
      return '${packageResult!.imageUrls.length} illustrated pages, '
          'storybook and narration are ready.';
    }
    if (hasError) {
      return 'The package could not be completed. '
          'Please review the message below and try again.';
    }
    return '$illustrationCount illustrated pages, '
        'PDF storybook and narration will be prepared.';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.field.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isReady
              ? AppColors.gold
              : hasError
                  ? const Color(0x66D98898)
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
          Icon(
            isReady
                ? Icons.auto_awesome_rounded
                : hasError
                    ? Icons.error_outline_rounded
                    : Icons.auto_stories_rounded,
            color: isReady
                ? AppColors.gold
                : hasError
                    ? const Color(0xFFD98898)
                    : AppColors.gold,
            size: 44,
          ),
          const SizedBox(height: 12),
          Text(
            title,
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
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.lavender,
              fontSize: 14,
              height: 1.55,
            ),
          ),
          if (hasError) ...[
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
                  height: 1.4,
                ),
              ),
            ),
          ],
          const SizedBox(height: 18),
          if (isPreparing)
            const _PreparingPackageIndicator()
          else if (!isReady)
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: onPrepare,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: AppColors.darkText,
                  padding: const EdgeInsets.symmetric(vertical: 17),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  hasError ? 'Try Again' : 'Prepare Star Package',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            )
          else ...[
            if (packageResult!.hasPdf)
              _PackageButton(
                icon: Icons.menu_book_rounded,
                label: 'Open Storybook',
                enabled: true,
                onPressed: onOpenPdf,
              )
            else
              const _UnavailablePackageItem(
                icon: Icons.menu_book_rounded,
                label: 'Storybook is not available.',
              ),
            const SizedBox(height: 11),
            if (packageResult!.hasAudio)
              _PackageButton(
                icon: Icons.headphones_rounded,
                label: 'Listen to Story',
                enabled: true,
                onPressed: onOpenAudio,
              )
            else
              const _UnavailablePackageItem(
                icon: Icons.headphones_rounded,
                label: 'Narration is not available.',
              ),
            const SizedBox(height: 11),
            // Video artık üç durum gösterebilir: hazır, hâlâ
            // arka planda üretiliyor, ya da üretilemedi. PDF ve
            // ses her durumda kullanılabilir kalır.
            if (packageResult!.hasVideo)
              _PackageButton(
                icon: Icons.play_circle_fill_rounded,
                label: 'Watch Story Video',
                enabled: true,
                onPressed: onOpenVideo,
              )
            else if (packageResult!.isVideoProcessing)
              _VideoProcessingIndicator(
                progress: packageResult!.videoProgress,
              )
            else if (packageResult!.isVideoFailed)
              const _UnavailablePackageItem(
                icon: Icons.play_circle_outline_rounded,
                label: 'Video could not be created. '
                    'Your storybook and narration are still ready.',
              )
            else
              const _UnavailablePackageItem(
                icon: Icons.play_circle_fill_rounded,
                label: 'Video will be added later.',
              ),
            if (packageResult!.hasImages) ...[
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.image_rounded,
                    color: AppColors.gold,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${packageResult!.imageUrls.length} '
                    'illustrated pages are ready.',
                    style: const TextStyle(
                      color: AppColors.lavender,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ],
          if (isReady &&
              packageResult!.disclosure != null &&
              packageResult!.disclosure!.trim().isNotEmpty) ...[
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

class _PreparingPackageIndicator extends StatelessWidget {
  const _PreparingPackageIndicator();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 17, horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.fieldBorder,
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 21,
            height: 21,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              color: AppColors.cream,
            ),
          ),
          SizedBox(width: 12),
          Flexible(
            child: Text(
              'Illustrated pages, storybook and narration '
              'are being prepared...',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.cream,
                fontSize: 14,
                height: 1.4,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Video hâlâ arka planda render edilirken gösterilen ilerleme
/// göstergesi. PDF ve ses butonları bundan bağımsız olarak zaten
/// aktiftir; bu yalnızca video satırının yerini alır.
class _VideoProcessingIndicator extends StatelessWidget {
  const _VideoProcessingIndicator({required this.progress});

  final int progress;

  @override
  Widget build(BuildContext context) {
    final clampedProgress = progress.clamp(0, 100);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.fieldBorder),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  color: AppColors.gold,
                ),
              ),
              const SizedBox(width: 10),
              Flexible(
                child: Text(
                  clampedProgress > 0
                      ? 'Video is being prepared... %$clampedProgress'
                      : 'Video is being prepared...',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.cream,
                    fontSize: 14,
                    height: 1.4,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: clampedProgress > 0 ? clampedProgress / 100 : null,
              minHeight: 6,
              backgroundColor: AppColors.fieldBorder,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.gold,
              ),
            ),
          ),
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
  });

  final IconData icon;
  final String label;
  final bool enabled;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: enabled ? onPressed : null,
        icon: Icon(icon),
        label: Text(label),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.cream,
          disabledForegroundColor: AppColors.muted,
          padding: const EdgeInsets.symmetric(
            vertical: 16,
            horizontal: 16,
          ),
          side: BorderSide(
            color: enabled ? AppColors.gold : AppColors.fieldBorder,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _UnavailablePackageItem extends StatelessWidget {
  const _UnavailablePackageItem({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.fieldBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: AppColors.muted),
          const SizedBox(width: 10),
          Flexible(
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.muted,
                fontSize: 14,
                height: 1.4,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ColoringBookSection extends StatelessWidget {
  const _ColoringBookSection({
    required this.isPreparing,
    required this.coloringBookUrl,
    required this.errorMessage,
    required this.onPrepare,
    required this.onOpen,
  });

  final bool isPreparing;
  final String? coloringBookUrl;
  final String? errorMessage;
  final VoidCallback onPrepare;
  final VoidCallback onOpen;

  bool get isReady =>
      coloringBookUrl != null && coloringBookUrl!.trim().isNotEmpty;
  bool get hasError =>
      errorMessage != null && errorMessage!.trim().isNotEmpty;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.field.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isReady ? AppColors.gold : AppColors.fieldBorder,
        ),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.brush_rounded,
            color: AppColors.gold,
            size: 36,
          ),
          const SizedBox(height: 10),
          Text(
            isReady
                ? 'Coloring Book is Ready 🎨'
                : 'Turn This Story into a Coloring Book',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.cream,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isReady
                ? 'A black-and-white version of all 10 pages, '
                    'ready to print and color.'
                : 'Create a printable black-and-white version '
                    'of the same 10 pages.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.lavender,
              fontSize: 13,
              height: 1.5,
            ),
          ),
          if (hasError) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0x33B55C6C),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0x66D98898)),
              ),
              child: Text(
                errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.cream,
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ),
          ],
          const SizedBox(height: 14),
          if (isPreparing)
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: AppColors.cream,
                  ),
                ),
                SizedBox(width: 10),
                Text(
                  'Preparing coloring pages...',
                  style: TextStyle(
                    color: AppColors.cream,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            )
          else if (isReady)
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onOpen,
                icon: const Icon(Icons.menu_book_rounded),
                label: const Text('Open Coloring Book'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.cream,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.gold),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            )
          else
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: onPrepare,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: AppColors.darkText,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: Text(
                  hasError ? 'Try Again' : 'Create Coloring Book',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
        ],
      ),
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
        color: AppColors.field.withValues(alpha: 0.82),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.fieldBorder),
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
