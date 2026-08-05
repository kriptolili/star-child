import 'package:flutter/material.dart';

import '../models/child_profile.dart';
import '../models/story_result.dart';
import '../services/story_api_service.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'story_screen.dart';

class LoadingScreen extends StatefulWidget {
  const LoadingScreen({
    super.key,
    required this.profile,
  });

  final ChildProfile profile;

  @override
  State<LoadingScreen> createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> {
  final StoryApiService _storyApiService = StoryApiService();

  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _createStory();
  }

  Future<void> _createStory() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final StoryResult result =
          await _storyApiService.createStory(widget.profile);

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => StoryScreen(
            profile: widget.profile,
            result: result,
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _errorMessage = error.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StarBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Center(
              child: _isLoading
                  ? _LoadingContent(profile: widget.profile)
                  : _ErrorContent(
                      message: _errorMessage ??
                          'Masal oluşturulurken bir sorun oluştu.',
                      onRetry: _createStory,
                      onBack: () => Navigator.pop(context),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

class _LoadingContent extends StatelessWidget {
  const _LoadingContent({
    required this.profile,
  });

  final ChildProfile profile;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(
          width: 58,
          height: 58,
          child: CircularProgressIndicator(
            color: AppColors.gold,
            strokeWidth: 3,
          ),
        ),
        const SizedBox(height: 32),
        Text(
          '${profile.name} için gökyüzü yeniden açılıyor...',
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.cream,
            fontSize: 26,
            height: 1.35,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Koruyucu yıldızı bulunuyor ve yalnızca ona ait masal yazılıyor.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.lavender,
            fontSize: 16,
            height: 1.6,
          ),
        ),
      ],
    );
  }
}

class _ErrorContent extends StatelessWidget {
  const _ErrorContent({
    required this.message,
    required this.onRetry,
    required this.onBack,
  });

  final String message;
  final VoidCallback onRetry;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(
          Icons.auto_awesome_outlined,
          size: 58,
          color: AppColors.gold,
        ),
        const SizedBox(height: 22),
        const Text(
          'Yıldız yolu kısa bir süreliğine kapanmış olabilir.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.cream,
            fontSize: 24,
            height: 1.35,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 14),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.lavender,
            fontSize: 15,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 28),
        PrimaryButton(
          label: 'Yeniden Dene',
          onPressed: onRetry,
        ),
        const SizedBox(height: 10),
        TextButton(
          onPressed: onBack,
          child: const Text(
            'Geri Dön',
            style: TextStyle(
              color: AppColors.lavender,
            ),
          ),
        ),
      ],
    );
  }
}