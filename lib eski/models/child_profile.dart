class ChildProfile {
  const ChildProfile({
    this.name = '',
    this.birthDate,
    this.birthTime,
    this.birthPlace = '',
  });

  final String name;
  final DateTime? birthDate;
  final DateTime? birthTime;
  final String birthPlace;

  ChildProfile copyWith({
    String? name,
    DateTime? birthDate,
    DateTime? birthTime,
    String? birthPlace,
  }) {
    return ChildProfile(
      name: name ?? this.name,
      birthDate: birthDate ?? this.birthDate,
      birthTime: birthTime ?? this.birthTime,
      birthPlace: birthPlace ?? this.birthPlace,
    );
  }
}