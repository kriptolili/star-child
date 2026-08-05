import 'package:flutter/material.dart';

import '../models/child_profile.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'birth_place_screen.dart';

class BirthTimeScreen extends StatefulWidget {
  const BirthTimeScreen({
    super.key,
    required this.profile,
  });

  final ChildProfile profile;

  @override
  State<BirthTimeScreen> createState() => _BirthTimeScreenState();
}

class _BirthTimeScreenState extends State<BirthTimeScreen> {
  TimeOfDay? _selectedTime;

  @override
  void initState() {
    super.initState();
    final saved = widget.profile.birthTime;
    if (saved != null) {
      _selectedTime = TimeOfDay(hour: saved.hour, minute: saved.minute);
    }
  }

  String get _formattedTime {
    final time = _selectedTime;
    if (time == null) return 'Doğum saatini seç';

    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Future<void> _selectTime() async {
    final selected = await showTimePicker(
      context: context,
      initialTime: _selectedTime ?? const TimeOfDay(hour: 12, minute: 0),
      helpText: 'Select birth time',
      cancelText: 'Cancel',
      confirmText: 'Select',
    );

    if (selected != null) {
      setState(() => _selectedTime = selected);
    }
  }

  void _continue() {
    final time = _selectedTime;
    final date = widget.profile.birthDate;
    if (time == null || date == null) return;

    final birthDateTime = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BirthPlaceScreen(
          profile: widget.profile.copyWith(birthTime: birthDateTime),
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
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 22),
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
                  '◷',
                  style: TextStyle(fontSize: 54, color: AppColors.gold),
                ),
                const SizedBox(height: 18),
                Text(
                  '${widget.profile.name}, what time did your little star arrive?',
                  
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
                  'Choose the moment your child took their very first breath.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.5,
                    color: AppColors.lavender,
                  ),
                ),
                const SizedBox(height: 30),
                InkWell(
                  onTap: _selectTime,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 20,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.field,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _selectedTime == null
                            ? AppColors.fieldBorder
                            : AppColors.gold,
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.schedule, color: AppColors.gold),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Text(
                            _formattedTime,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: _selectedTime == null
                                  ? const Color(0xFF8F89AB)
                                  : AppColors.cream,
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 38),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                PrimaryButton(
                  label: 'Devam Et',
                  onPressed: _selectedTime == null ? null : _continue,
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
