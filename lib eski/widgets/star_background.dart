import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class StarBackground extends StatelessWidget {
  const StarBackground({
    super.key,
    required this.child,
  });

  final Widget child;

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
            AppColors.backgroundTop,
            AppColors.backgroundMiddle,
            AppColors.backgroundBottom,
          ],
        ),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          const IgnorePointer(
            child: _DecorativeStars(),
          ),
          child,
        ],
      ),
    );
  }
}

class _DecorativeStars extends StatelessWidget {
  const _DecorativeStars();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _StarPainter(),
    );
  }
}

class _StarPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final smallStarPaint = Paint()
      ..color = AppColors.cream.withValues(alpha: 0.30);

    final goldStarPaint = Paint()
      ..color = AppColors.gold.withValues(alpha: 0.42);

    final stars = <_StarPoint>[
      _StarPoint(0.10, 0.14, 1.4, false),
      _StarPoint(0.81, 0.10, 1.1, false),
      _StarPoint(0.67, 0.31, 1.8, true),
      _StarPoint(0.18, 0.48, 1.0, false),
      _StarPoint(0.90, 0.67, 1.3, false),
      _StarPoint(0.31, 0.82, 1.7, true),
      _StarPoint(0.72, 0.90, 1.0, false),
      _StarPoint(0.46, 0.20, 0.9, false),
      _StarPoint(0.56, 0.58, 1.2, false),
      _StarPoint(0.13, 0.72, 0.8, false),
      _StarPoint(0.84, 0.42, 0.9, false),
      _StarPoint(0.42, 0.94, 1.4, true),
    ];

    for (final star in stars) {
      final position = Offset(
        size.width * star.x,
        size.height * star.y,
      );

      canvas.drawCircle(
        position,
        star.radius,
        star.isGold ? goldStarPaint : smallStarPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
}

class _StarPoint {
  const _StarPoint(
    this.x,
    this.y,
    this.radius,
    this.isGold,
  );

  final double x;
  final double y;
  final double radius;
  final bool isGold;
}