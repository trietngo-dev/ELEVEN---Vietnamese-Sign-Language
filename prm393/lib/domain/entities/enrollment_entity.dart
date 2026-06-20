class EnrollmentEntity {
  final int id;
  final int userId;
  final int courseId;
  final double progressPercent;
  final String status;

  const EnrollmentEntity({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.progressPercent,
    required this.status,
  });
}
