class ChildProfile {
  const ChildProfile({
    this.name = '',
    this.birthDate,
    this.birthTime,
    this.birthPlace = '',

    // NEW
    this.appearanceMode = 'auto',
    this.appearanceRegion = 'auto',
    this.storyLanguage = 'auto',
    this.photoPath,

    this.voiceEnabled = true,
    this.musicEnabled = true,
  });

  final String name;
  final DateTime? birthDate;
  final DateTime? birthTime;
  final String birthPlace;

  // ==========================
  // STAR CHILD v1.0
  // ==========================

  /// auto / custom
  final String appearanceMode;

  /// auto
  /// east_asia
  /// south_asia
  /// africa
  /// europe
  /// middle_east
  /// latin_america
  /// mixed
  final String appearanceRegion;

  /// auto
  /// tr
  /// en
  /// de
  /// fr
  /// es
  /// pt
  /// ar
  /// hi
  /// ja
  /// ko
  /// zh
  final String storyLanguage;

  /// Optional photo
  final String? photoPath;

  /// Video narration
  final bool voiceEnabled;

  /// Background music
  final bool musicEnabled;

  // ==========================
  // API
  // ==========================

  String get birthDateForApi {
    if (birthDate == null) return "";

    return "${birthDate!.year.toString().padLeft(4, '0')}-"
        "${birthDate!.month.toString().padLeft(2, '0')}-"
        "${birthDate!.day.toString().padLeft(2, '0')}";
  }

  String get birthTimeForApi {
    if (birthTime == null) return "";

    return "${birthTime!.hour.toString().padLeft(2, '0')}:"
        "${birthTime!.minute.toString().padLeft(2, '0')}";
  }

  ChildProfile copyWith({
    String? name,
    DateTime? birthDate,
    DateTime? birthTime,
    String? birthPlace,

    String? appearanceMode,
    String? appearanceRegion,
    String? storyLanguage,
    String? photoPath,

    bool? voiceEnabled,
    bool? musicEnabled,
  }) {
    return ChildProfile(
      name: name ?? this.name,
      birthDate: birthDate ?? this.birthDate,
      birthTime: birthTime ?? this.birthTime,
      birthPlace: birthPlace ?? this.birthPlace,

      appearanceMode:
          appearanceMode ?? this.appearanceMode,

      appearanceRegion:
          appearanceRegion ?? this.appearanceRegion,

      storyLanguage:
          storyLanguage ?? this.storyLanguage,

      photoPath:
          photoPath ?? this.photoPath,

      voiceEnabled:
          voiceEnabled ?? this.voiceEnabled,

      musicEnabled:
          musicEnabled ?? this.musicEnabled,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "childName": name,
      "birthDate": birthDateForApi,
      "birthTime": birthTimeForApi,
      "birthPlace": birthPlace,

      "appearanceMode": appearanceMode,
      "appearanceRegion": appearanceRegion,
      "storyLanguage": storyLanguage,
      "photoPath": photoPath,

      "voiceEnabled": voiceEnabled,
      "musicEnabled": musicEnabled,
    };
  }
}