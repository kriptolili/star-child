import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/child_profile.dart';
import '../models/story_result.dart';

class StoryApiService {
  static const String _baseUrl = 'https://star-child.onrender.com';

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
      // Video artık pakete dahil beklenmiyor; PDF ve ses hazır olur
      // olmaz cevap döner. Bu yüzden zaman aşımı süresi kısaltıldı.
      timeout: const Duration(minutes: 8),
      fallbackError:
          'Resimler, Yıldız Kitabı ve ses hazırlanamadı.',
    );
    return StarPackageResult.fromJson(decodedBody);
  }

  /// Video görevinin durumunu sorgular.
  ///
  /// Backend'de video, paketten ayrı bir arka plan görevi olarak
  /// çalışır. Bu metod GET /video-status/:jobId adresini çağırır ve
  /// mevcut durumu (pending / processing / ready / failed) döner.
  Future<VideoStatusResult> getVideoStatus(
    String jobId,
  ) async {
    final response = await http
        .get(
          Uri.parse('$_baseUrl/video-status/$jobId'),
        )
        .timeout(const Duration(seconds: 20));

    final decodedBody = _decodeResponse(
      response,
      fallbackError:
          'Video durumu alınamadı. Lütfen yeniden deneyin.',
    );

    if (decodedBody is! Map<String, dynamic>) {
      throw Exception(
        'Sunucudan geçersiz veri geldi.',
      );
    }

    return VideoStatusResult.fromJson(decodedBody);
  }

  /// Daha önce hazırlanmış Yıldız Paketi'ndeki renkli sayfalardan
  /// siyah-beyaz bir boyama kitabı PDF'i oluşturur.
  ///
  /// Not: Bu metod çağrılmadan önce createPackage() ile paket
  /// hazırlanmış olmalı — boyama kitabı, o paketin renkli
  /// sayfalarını referans alır.
  Future<ColoringBookResult> createColoringBook({
    required ChildProfile profile,
    required Map<String, dynamic> storyJson,
  }) async {
    final decodedBody = await _postJson(
      endpoint: '/coloring-book',
      body: {
        'profile': _profileBody(profile),
        'story': storyJson,
      },
      timeout: const Duration(minutes: 10),
      fallbackError:
          'Boyama kitabı hazırlanamadı. Lütfen yeniden deneyin.',
    );
    return ColoringBookResult.fromJson(decodedBody);
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
    this.videoJobId,
    this.videoStatus = 'unavailable',
    this.videoProgress = 0,
  });

  final String message;
  final String? pdfUrl;
  final String? audioUrl;
  final String? videoUrl;
  final List<String> imageUrls;
  final String? disclosure;

  /// Backend'in arka planda başlattığı video görevinin kimliği.
  /// null ise (örn. seslendirme kapalıysa) video hiç üretilmiyor
  /// demektir.
  final String? videoJobId;

  /// pending / processing / ready / failed / unavailable
  final String videoStatus;

  /// 0-100 arası video render ilerlemesi.
  final int videoProgress;

  bool get hasPdf =>
      pdfUrl != null && pdfUrl!.trim().isNotEmpty;
  bool get hasAudio =>
      audioUrl != null && audioUrl!.trim().isNotEmpty;
  bool get hasVideo =>
      videoUrl != null && videoUrl!.trim().isNotEmpty;
  bool get hasImages => imageUrls.isNotEmpty;

  /// Video hâlâ arka planda üretiliyor mu?
  bool get isVideoProcessing =>
      videoJobId != null &&
      (videoStatus == 'pending' || videoStatus == 'processing');

  bool get isVideoFailed => videoStatus == 'failed';

  /// Değişmez (immutable) sonuç nesnesini video alanları
  /// güncellenmiş yeni bir kopyasıyla değiştirir. Polling sırasında
  /// state güncellemek için kullanılır.
  StarPackageResult copyWithVideo({
    String? videoUrl,
    String? videoStatus,
    int? videoProgress,
  }) {
    return StarPackageResult(
      message: message,
      pdfUrl: pdfUrl,
      audioUrl: audioUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      imageUrls: imageUrls,
      disclosure: disclosure,
      videoJobId: videoJobId,
      videoStatus: videoStatus ?? this.videoStatus,
      videoProgress: videoProgress ?? this.videoProgress,
    );
  }

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
      videoJobId: json['videoJobId'] is String
          ? json['videoJobId'] as String
          : null,
      videoStatus: json['videoStatus'] is String
          ? json['videoStatus'] as String
          : 'unavailable',
      videoProgress: json['videoProgress'] is int
          ? json['videoProgress'] as int
          : 0,
    );
  }
}

class VideoStatusResult {
  const VideoStatusResult({
    required this.status,
    required this.videoUrl,
    required this.progress,
    this.error,
  });

  /// pending / processing / ready / failed
  final String status;
  final String? videoUrl;
  final int progress;
  final String? error;

  bool get isReady => status == 'ready';
  bool get isFailed => status == 'failed';
  bool get isProcessing =>
      status == 'pending' || status == 'processing';

  factory VideoStatusResult.fromJson(
    Map<String, dynamic> json,
  ) {
    return VideoStatusResult(
      status: json['status'] is String
          ? json['status'] as String
          : 'failed',
      videoUrl: json['videoUrl'] is String
          ? json['videoUrl'] as String
          : null,
      progress: json['progress'] is int
          ? json['progress'] as int
          : 0,
      error: json['error'] is String
          ? json['error'] as String
          : null,
    );
  }
}

class ColoringBookResult {
  const ColoringBookResult({
    required this.message,
    required this.coloringBookUrl,
  });

  final String message;
  final String? coloringBookUrl;

  bool get hasColoringBook =>
      coloringBookUrl != null &&
      coloringBookUrl!.trim().isNotEmpty;

  factory ColoringBookResult.fromJson(
    Map<String, dynamic> json,
  ) {
    return ColoringBookResult(
      message: json['message'] is String
          ? json['message'] as String
          : 'Boyama kitabın hazır.',
      coloringBookUrl: json['coloringBookUrl'] is String
          ? json['coloringBookUrl'] as String
          : null,
    );
  }
}
