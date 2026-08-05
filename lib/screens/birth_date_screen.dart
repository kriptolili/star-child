import 'package:flutter/material.dart';

import '../models/child_profile.dart';
import '../theme/app_colors.dart';
import '../widgets/primary_button.dart';
import '../widgets/star_background.dart';
import 'birth_time_screen.dart';

class BirthDateScreen extends StatefulWidget {
  const BirthDateScreen({
    super.key,
    required this.profile,
  });

  final ChildProfile profile;

  @override
  State<BirthDateScreen> createState() => _BirthDateScreenState();
}

class _BirthDateScreenState extends State<BirthDateScreen> {
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.profile.birthDate;
  }

  String get _formattedDate {
    final date = _selectedDate;
    if (date == null) return 'Select the birth date';

  const months = [
      'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
      
    
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  Future<void> _selectDate() async {
    final now = DateTime.now();
    final selected = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime(now.year - 5),
      firstDate: DateTime(1900),
      lastDate: now,
      helpText: '${widget.profile.name} When did your little star arrive?',
      cancelText: 'Cancel',
      confirmText: 'Select',
    );

    if (selected != null) {
      setState(() => _selectedDate = selected);
    }
  }

  void _continue() {
    final date = _selectedDate;
    if (date == null) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => BirthTimeScreen(
          profile: widget.profile.copyWith(birthDate: date),
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
                  '☀',
                  style: TextStyle(fontSize: 54, color: AppColors.gold),
                ),
                const SizedBox(height: 18),
                Text(
                  '${widget.profile.name} When did the sky first meet your little star?',
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
                  'Gökyüzü onunla ilk ne zaman tanıştı?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.5,
                    color: AppColors.lavender,
                  ),
                ),
                const SizedBox(height: 30),
                InkWell(
                  onTap: _selectDate,
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
                        color: _selectedDate == null
                            ? AppColors.fieldBorder
                            : AppColors.gold,
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.calendar_month_rounded,
                          color: AppColors.gold,
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Text(
                            _formattedDate,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: _selectedDate == null
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
                  onPressed: _selectedDate == null ? null : _continue,
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
