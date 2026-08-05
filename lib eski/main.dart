import 'package:flutter/material.dart';

void main() {
  runApp(const ZodiacTalesApp());
}

class ZodiacTalesApp extends StatelessWidget {
  const ZodiacTalesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Zodiac Tales',
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Georgia',
      ),
      home: const WelcomeScreen(),
    );
  }
}

// ─────────────────────────────────────────────
// ORTAK ARKA PLAN
// ─────────────────────────────────────────────

class StarBackground extends StatelessWidget {
  final Widget child;

  const StarBackground({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF11102F),
            Color(0xFF1B1947),
            Color(0xFF0C0B22),
          ],
        ),
      ),
      child: child,
    );
  }
}

// ─────────────────────────────────────────────
// 1. AÇILIŞ EKRANI
// ─────────────────────────────────────────────

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
                    color: Color(0xFFE8B975),
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
                    color: Color(0xFFB9A6D9),
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
                    color: Color(0xFFF8F3E7),
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
                    color: Color(0xFFC9C3E0),
                  ),
                ),

                const Spacer(),

                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ChildNameScreen(),
                        ),
                      );
                    },
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFE8B975),
                      foregroundColor: const Color(0xFF17142F),
                      padding: const EdgeInsets.symmetric(vertical: 17),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Hikâyeni Başlat',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                const Text(
                  'Masal • Video • Hatıra PDF',
                  style: TextStyle(
                    fontSize: 13,
                    letterSpacing: 1,
                    color: Color(0xFF9D97BC),
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

// ─────────────────────────────────────────────
// 2. ÇOCUK ADI EKRANI
// ─────────────────────────────────────────────

class ChildNameScreen extends StatefulWidget {
  const ChildNameScreen({super.key});

  @override
  State<ChildNameScreen> createState() => _ChildNameScreenState();
}

class _ChildNameScreenState extends State<ChildNameScreen> {
  final TextEditingController _nameController = TextEditingController();

  bool get _hasName => _nameController.text.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();

    _nameController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _continue() {
    final childName = _nameController.text.trim();

    if (childName.isEmpty) {
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BirthDateScreen(
          childName: childName,
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
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: Color(0xFFF8F3E7),
                    ),
                  ),
                ),

                const Spacer(),

                const Text(
                  '✦',
                  style: TextStyle(
                    fontSize: 54,
                    color: Color(0xFFE8B975),
                  ),
                ),

                const SizedBox(height: 18),

                const Text(
                  'Bu küçük yıldızın adı ne?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 30,
                    height: 1.3,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFF8F3E7),
                  ),
                ),

                const SizedBox(height: 12),

                const Text(
                  'Yıldızların kimi beklediğini söyle...',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.5,
                    color: Color(0xFFB9A6D9),
                  ),
                ),

                const SizedBox(height: 30),

                TextField(
                  controller: _nameController,
                  textAlign: TextAlign.center,
                  textCapitalization: TextCapitalization.words,
                  style: const TextStyle(
                    color: Color(0xFFF8F3E7),
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Örn. Mila',
                    hintStyle: const TextStyle(
                      color: Color(0xFF8F89AB),
                      fontWeight: FontWeight.w400,
                    ),
                    filled: true,
                    fillColor: const Color(0xFF211F4A),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 18,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(
                        color: Color(0xFF393568),
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(
                        color: Color(0xFFE8B975),
                        width: 1.5,
                      ),
                    ),
                  ),
                  onSubmitted: (_) {
                    if (_hasName) {
                      _continue();
                    }
                  },
                ),

                const Spacer(),

                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _hasName ? _continue : null,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFE8B975),
                      foregroundColor: const Color(0xFF17142F),
                      disabledBackgroundColor:
                          const Color(0xFFE8B975).withOpacity(0.35),
                      disabledForegroundColor:
                          const Color(0xFF17142F).withOpacity(0.55),
                      padding: const EdgeInsets.symmetric(vertical: 17),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Devam Et',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
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

// ─────────────────────────────────────────────
// 3. DOĞUM TARİHİ EKRANI
// ─────────────────────────────────────────────

class BirthDateScreen extends StatefulWidget {
  final String childName;

  const BirthDateScreen({
    super.key,
    required this.childName,
  });

  @override
  State<BirthDateScreen> createState() => _BirthDateScreenState();
}

class _BirthDateScreenState extends State<BirthDateScreen> {
  DateTime? _selectedDate;

  String get _formattedDate {
    final date = _selectedDate;

    if (date == null) {
      return 'Doğum tarihini seç';
    }

    const months = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
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
      helpText: '${widget.childName} ne zaman dünyaya geldi?',
      cancelText: 'Vazgeç',
      confirmText: 'Seç',
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFFE8B975),
              onPrimary: Color(0xFF17142F),
              surface: Color(0xFF211F4A),
              onSurface: Color(0xFFF8F3E7),
            ),
            dialogTheme: const DialogThemeData(
              backgroundColor: Color(0xFF17153C),
            ),
          ),
          child: child!,
        );
      },
    );

    if (selected != null) {
      setState(() {
        _selectedDate = selected;
      });
    }
  }

  void _continue() {
    if (_selectedDate == null) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '${widget.childName} için doğum tarihi kaydedildi ✨',
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
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: Color(0xFFF8F3E7),
                    ),
                  ),
                ),

                const Spacer(),

                const Text(
                  '☀',
                  style: TextStyle(
                    fontSize: 54,
                    color: Color(0xFFE8B975),
                  ),
                ),

                const SizedBox(height: 18),

                Text(
                  '${widget.childName} ne zaman dünyaya geldi?',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 30,
                    height: 1.3,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFF8F3E7),
                  ),
                ),

                const SizedBox(height: 12),

                const Text(
                  'Gökyüzü onunla ilk ne zaman tanıştı?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    height: 1.5,
                    color: Color(0xFFB9A6D9),
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
                      color: const Color(0xFF211F4A),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _selectedDate == null
                            ? const Color(0xFF393568)
                            : const Color(0xFFE8B975),
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.calendar_month_rounded,
                          color: Color(0xFFE8B975),
                        ),

                        const SizedBox(width: 14),

                        Expanded(
                          child: Text(
                            _formattedDate,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: _selectedDate == null
                                  ? const Color(0xFF8F89AB)
                                  : const Color(0xFFF8F3E7),
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

                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _selectedDate == null ? null : _continue,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFE8B975),
                      foregroundColor: const Color(0xFF17142F),
                      disabledBackgroundColor:
                          const Color(0xFFE8B975).withOpacity(0.35),
                      disabledForegroundColor:
                          const Color(0xFF17142F).withOpacity(0.55),
                      padding: const EdgeInsets.symmetric(vertical: 17),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Devam Et',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
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