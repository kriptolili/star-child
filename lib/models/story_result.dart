class StoryResult {
  const StoryResult({
    required this.guardianStar,
    required this.guardianStarMeaning,
    required this.title,
    required this.openingNote,
    required this.story,
    required this.lullaby,
    required this.starMessage,
    required this.illustrations,
    required this.rawJson,
  });

  final String guardianStar;
  final String guardianStarMeaning;
  final String title;
  final String openingNote;
  final String story;
  final String lullaby;
  final String starMessage;

  /// Backend’in ürettiği 10 resimli sayfa.
  final List<StoryIllustration> illustrations;

  /// `/package` endpoint’ine eksiksiz göndermek için
  /// orijinal masal JSON’u korunur.
  final Map<String, dynamic> rawJson;

  factory StoryResult.fromJson(
    Map<String, dynamic> json,
  ) {
    final rawIllustrations = json['illustrations'];

    final illustrations = rawIllustrations is List
        ? rawIllustrations
            .whereType<Map>()
            .map(
              (item) => StoryIllustration.fromJson(
                Map<String, dynamic>.from(item),
              ),
            )
            .toList()
        : <StoryIllustration>[];

    return StoryResult(
      guardianStar: _readString(
        json,
        'guardianStar',
      ),
      guardianStarMeaning: _readString(
        json,
        'guardianStarMeaning',
      ),
      title: _readString(
        json,
        'title',
      ),
      openingNote: _readString(
        json,
        'openingNote',
      ),
      story: _readString(
        json,
        'story',
      ),
      lullaby: _readString(
        json,
        'lullaby',
      ),
      starMessage: _readString(
        json,
        'starMessage',
      ),
      illustrations: illustrations,
      rawJson: Map<String, dynamic>.from(json),
    );
  }

  Map<String, dynamic> toJson() {
    return Map<String, dynamic>.from(rawJson);
  }

  static String _readString(
    Map<String, dynamic> json,
    String key,
  ) {
    final value = json[key];

    return value is String ? value : '';
  }
}

class StoryIllustration {
  const StoryIllustration({
    required this.title,
    required this.text,
    required this.caption,
    required this.prompt,
    required this.discoveries,
  });

  final String title;
  final String text;
  final String caption;
  final String prompt;
  final List<String> discoveries;

  factory StoryIllustration.fromJson(
    Map<String, dynamic> json,
  ) {
    final rawDiscoveries = json['discoveries'];

    return StoryIllustration(
      title: _readString(json, 'title'),
      text: _readString(json, 'text'),
      caption: _readString(json, 'caption'),
      prompt: _readString(json, 'prompt'),
      discoveries: rawDiscoveries is List
          ? rawDiscoveries
              .whereType<String>()
              .toList()
          : const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'text': text,
      'caption': caption,
      'prompt': prompt,
      'discoveries': discoveries,
    };
  }

  static String _readString(
    Map<String, dynamic> json,
    String key,
  ) {
    final value = json[key];

    return value is String ? value : '';
  }
}