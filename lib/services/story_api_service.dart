import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/child_profile.dart';
import '../models/story_result.dart';

class StoryApiService {
  static const String _baseUrl = 'http://127.0.0.1:3000';

  Future<StoryResult> createStory(
    ChildProfile profile,
  ) async {
    final decodedBody = await _postJson(
      endpoint: '/story',
      body: _profileBody(profile),
      timeout: const Duration(minutes: 5),
      fallbackError:
          'Masal oluşturulamadı. Lütfen yeniden deneyin.',
    );

    return StoryResult.fromJson(decodedBody);
  }

  Future<StarPackageResult> createPackage({
    required ChildProfile profile,
    required Map<String, dynamic> storyJson,
  }) async {
    final decodedBody = await _postJson(
      endpoint: '/package',
      body: {
        'profile': _profileBody(profile),
        'story': storyJson,
      },
      timeout: const Duration(minutes: 20),
      fallbackError:
          'Resimler, Yıldız Kitabı ve ses hazırlanamadı.',
    );

    return StarPackageResult.fromJson(decodedBody);
  }

  Map<String, dynamic> _profileBody(
    ChildProfile profile,
  ) {
    return {
      ...profile.toJson(),

      // Gerçek fotoğraf yüklemesi henüz bağlanmadığı için
      // backend'e yalnızca fotoğraf seçilip seçilmediği gönderilir.
      'photoProvided':
          profile.photoPath != null &&
          profile.photoPath!.trim().isNotEmpty,
    };
  }

  Future<Map<String, dynamic>> _postJson({
    required String endpoint,
    required Map<String, dynamic> body,
    required Duration timeout,
    required String fallbackError,
  }) async {
    final response = await http
        .post(
          Uri.parse('$_baseUrl$endpoint'),
          headers: const {
            'Content-Type': 'application/json',
          },
          body: jsonEncode(body),
        )
        .timeout(timeout);

    final decodedBody = _decodeResponse(
      response,
      fallbackError: fallbackError,
    );

    if (decodedBody is! Map<String, dynamic>) {
      throw Exception(
        'Sunucudan geçersiz veri geldi.',
      );
    }

    return decodedBody;
  }

  dynamic _decodeResponse(
    http.Response response, {
    required String fallbackError,
  }) {
    dynamic decodedBody;

    try {
      decodedBody = jsonDecode(response.body);
    } catch (_) {
      if (response.statusCode < 200 ||
          response.statusCode >= 300) {
        throw Exception(fallbackError);
      }

      throw Exception(
        'Sunucudan okunamayan bir yanıt geldi.',
      );
    }

    if (response.statusCode < 200 ||
        response.statusCode >= 300) {
      String message = fallbackError;

      if (decodedBody is Map<String, dynamic> &&
          decodedBody['error'] is String &&
          (decodedBody['error'] as String).trim().isNotEmpty) {
        message = decodedBody['error'] as String;
      }

      throw Exception(message);
    }

    return decodedBody;
  }
}

class StarPackageResult {
  const StarPackageResult({
    required this.message,
    required this.pdfUrl,
    required this.audioUrl,
    required this.videoUrl,
    required this.imageUrls,
    required this.disclosure,
  });

  final String message;
  final String? pdfUrl;
  final String? audioUrl;
  final String? videoUrl;
  final List<String> imageUrls;
  final String? disclosure;

  bool get hasPdf =>
      pdfUrl != null && pdfUrl!.trim().isNotEmpty;

  bool get hasAudio =>
      audioUrl != null && audioUrl!.trim().isNotEmpty;

  bool get hasVideo =>
      videoUrl != null && videoUrl!.trim().isNotEmpty;

  bool get hasImages => imageUrls.isNotEmpty;

  factory StarPackageResult.fromJson(
    Map<String, dynamic> json,
  ) {
    final rawImages = json['imageUrls'];

    return StarPackageResult(
      message: json['message'] is String
          ? json['message'] as String
          : 'Yıldız paketin hazır.',

      pdfUrl: json['pdfUrl'] is String
          ? json['pdfUrl'] as String
          : null,

      audioUrl: json['audioUrl'] is String
          ? json['audioUrl'] as String
          : null,

      videoUrl: json['videoUrl'] is String
          ? json['videoUrl'] as String
          : null,

      imageUrls: rawImages is List
          ? rawImages
              .whereType<String>()
              .where(
                (url) => url.trim().isNotEmpty,
              )
              .toList()
          : const [],

      disclosure: json['disclosure'] is String
          ? json['disclosure'] as String
          : null,
    );
  }
}