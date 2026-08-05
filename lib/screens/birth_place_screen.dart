import 'package:flutter/material.dart';

import '../models/child_profile.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'appearance_screen.dart';

class BirthPlaceScreen extends StatefulWidget {
  const BirthPlaceScreen({
    super.key,
    required this.profile,
  });

  final ChildProfile profile;

  @override
  State<BirthPlaceScreen> createState() => _BirthPlaceScreenState();
}

class _BirthPlaceScreenState extends State<BirthPlaceScreen> {
  final _controller = TextEditingController();

  bool get _canContinue => _controller.text.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();
    _controller.text = widget.profile.birthPlace;
    _controller.addListener(_refresh);
  }

  void _refresh() => setState(() {});

  @override
  void dispose() {
    _controller
      ..removeListener(_refresh)
      ..dispose();

    super.dispose();
  }

  void _continue() {
    final place = _controller.text.trim();

    if (place.isEmpty) return;

    final updatedProfile = widget.profile.copyWith(
      birthPlace: place,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AppearanceScreen(
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
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 28,
              vertical: 22,
            ),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: AppColors.cream,
                    ),
                  ),
                ),
                const Spacer(),
                const Text(
                  '⌖',
                  style: TextStyle(
                    fontSize: 54,
                    color: AppColors.gold,
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'Where in the world was ${widget.profile.name} born?',
                  
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 30,
                    height: 1.3,
                    fontWeight: FontWeight.w600,
                    color: AppColors.cream,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Enter the birth city and country.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.5,
                    color: AppColors.lavender,
                  ),
                ),
                const SizedBox(height: 30),
                TextField(
                  controller: _controller,
                  textAlign: TextAlign.center,
                  textCapitalization: TextCapitalization.words,
                  onSubmitted: (_) {
                    if (_canContinue) {
                      _continue();
                    }
                  },
                  style: const TextStyle(
                    color: AppColors.cream,
                    fontSize: 19,
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: InputDecoration(
                    hintText: 'ee.g. London, United Kingdom',
                    hintStyle: const TextStyle(
                      color: Color(0xFF8F89AB),
                    ),
                    filled: true,
                    fillColor: AppColors.field,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 18,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(
                        color: AppColors.fieldBorder,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(
                        color: AppColors.gold,
                        width: 1.5,
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                PrimaryButton(
                  label: 'Design Your Star Child',
                  onPressed: _canContinue ? _continue : null,
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }
}