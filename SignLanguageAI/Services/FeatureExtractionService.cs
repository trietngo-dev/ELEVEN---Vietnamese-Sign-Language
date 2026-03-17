using SignLanguageAI.Models;

namespace SignLanguageAI.Services
{
    /// <summary>
    /// Service to extract and normalize 20,640 features from MediaPipe keypoints
    /// Performs: Spatial Normalization + Temporal Padding + Flattening
    /// </summary>
    public class FeatureExtractionService
    {
        private readonly ILogger<FeatureExtractionService> _logger;
        private const int MAX_FRAMES = 80;
        private const int POSE_POINTS = 33;
        private const int HAND_POINTS = 21;
        private const int FEATURES_PER_POSE_POINT = 4; // x, y, z, visibility
        private const int FEATURES_PER_HAND_POINT = 3; // x, y, z (no visibility)
        private const int FEATURES_PER_FRAME = 258;    // 33*4 + 21*3 + 21*3
        private const int TOTAL_FEATURES = 20640;      // 80 * 258

        public FeatureExtractionService(ILogger<FeatureExtractionService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Extract 20,640 normalized features from keypoints input
        /// </summary>
        public List<float> ExtractFeatures(KeypointsInput input)
        {
            if (input == null || input.Frames == null || input.Frames.Count == 0)
                throw new ArgumentException("KeypointsInput không được rỗng");

            _logger.LogInformation($"Extracting features from {input.Frames.Count} frames");

            // Validate all frames
            foreach (var frame in input.Frames)
            {
                if (!frame.IsValid())
                    throw new ArgumentException(
                        $"Frame không hợp lệ. Expected: 33 pose, 21 left hand, 21 right hand. " +
                        $"Got: {frame.Pose.Count} pose, {frame.LeftHand.Count} left, {frame.RightHand.Count} right"
                    );
            }

            // Step 1: Normalize all frames (Spatial Normalization using Nose)
            var normalizedFrames = NormalizeFrames(input.Frames);

            // Step 2: Pad or truncate to exactly 80 frames
            var paddedFrames = PadFrames(normalizedFrames);

            // Step 3: Flatten to 20,640 features
            var features = FlattenFrames(paddedFrames);

            _logger.LogInformation($"✓ Extracted {features.Count} features from {paddedFrames.Count} frames");

            return features;
        }

        /// <summary>
        /// Normalize frames by subtracting Nose position (translation invariance)
        /// Nose is at index 0 in pose keypoints
        /// </summary>
        private List<FrameKeypoints> NormalizeFrames(List<FrameKeypoints> frames)
        {
            var normalized = new List<FrameKeypoints>();

            foreach (var frame in frames)
            {
                // Nose is always at index 0 in pose
                if (frame.Pose.Count == 0)
                    throw new Exception("Pose không có keypoints");

                var nosePoint = frame.Pose[0];
                var normalizedFrame = new FrameKeypoints();

                // Normalize Pose: subtract nose position from all pose points
                foreach (var point in frame.Pose)
                {
                    normalizedFrame.Pose.Add(new Keypoint
                    {
                        X = point.X - nosePoint.X,
                        Y = point.Y - nosePoint.Y,
                        Z = point.Z - nosePoint.Z,
                        Visibility = point.Visibility
                    });
                }

                // Normalize Left Hand: subtract nose position
                foreach (var point in frame.LeftHand)
                {
                    normalizedFrame.LeftHand.Add(new Keypoint
                    {
                        X = point.X - nosePoint.X,
                        Y = point.Y - nosePoint.Y,
                        Z = point.Z - nosePoint.Z,
                        Visibility = point.Visibility
                    });
                }

                // Normalize Right Hand: subtract nose position
                foreach (var point in frame.RightHand)
                {
                    normalizedFrame.RightHand.Add(new Keypoint
                    {
                        X = point.X - nosePoint.X,
                        Y = point.Y - nosePoint.Y,
                        Z = point.Z - nosePoint.Z,
                        Visibility = point.Visibility
                    });
                }

                normalized.Add(normalizedFrame);
            }

            _logger.LogInformation($"✓ Normalized {normalized.Count} frames (using Nose as origin)");
            return normalized;
        }

        /// <summary>
        /// Pad frames to exactly MAX_FRAMES (80) or truncate if longer
        /// Use zero-padding at the end if shorter
        /// </summary>
        private List<FrameKeypoints> PadFrames(List<FrameKeypoints> frames)
        {
            var padded = new List<FrameKeypoints>();

            // Add existing frames
            for (int i = 0; i < Math.Min(frames.Count, MAX_FRAMES); i++)
            {
                padded.Add(frames[i]);
            }

            // Pad with zero frames if shorter than MAX_FRAMES
            while (padded.Count < MAX_FRAMES)
            {
                var emptyFrame = new FrameKeypoints
                {
                    Pose = Enumerable.Range(0, POSE_POINTS)
                        .Select(_ => new Keypoint { X = 0, Y = 0, Z = 0, Visibility = 0 })
                        .ToList(),
                    LeftHand = Enumerable.Range(0, HAND_POINTS)
                        .Select(_ => new Keypoint { X = 0, Y = 0, Z = 0, Visibility = 0 })
                        .ToList(),
                    RightHand = Enumerable.Range(0, HAND_POINTS)
                        .Select(_ => new Keypoint { X = 0, Y = 0, Z = 0, Visibility = 0 })
                        .ToList()
                };
                padded.Add(emptyFrame);
            }

            if (frames.Count > MAX_FRAMES)
                _logger.LogWarning($"⚠️  Video truncated from {frames.Count} to {MAX_FRAMES} frames");
            else if (frames.Count < MAX_FRAMES)
                _logger.LogInformation($"✓ Padded from {frames.Count} to {MAX_FRAMES} frames");
            else
                _logger.LogInformation($"✓ Exactly {MAX_FRAMES} frames");

            return padded;
        }

        /// <summary>
        /// Flatten all frames into 20,640 feature vector
        /// Structure per frame:
        ///   - Pose (33 points × 4 values) = 132 features
        ///   - Left Hand (21 points × 3 values) = 63 features
        ///   - Right Hand (21 points × 3 values) = 63 features
        ///   = 258 features per frame
        /// Total: 80 frames × 258 = 20,640 features
        /// </summary>
        private List<float> FlattenFrames(List<FrameKeypoints> frames)
        {
            var features = new List<float>();

            foreach (var frame in frames)
            {
                // Flatten Pose (33 × 4)
                foreach (var point in frame.Pose)
                {
                    features.Add(point.X);
                    features.Add(point.Y);
                    features.Add(point.Z);
                    features.Add(point.Visibility);
                }

                // Flatten Left Hand (21 × 3)
                foreach (var point in frame.LeftHand)
                {
                    features.Add(point.X);
                    features.Add(point.Y);
                    features.Add(point.Z);
                }

                // Flatten Right Hand (21 × 3)
                foreach (var point in frame.RightHand)
                {
                    features.Add(point.X);
                    features.Add(point.Y);
                    features.Add(point.Z);
                }
            }

            if (features.Count != TOTAL_FEATURES)
                throw new Exception(
                    $"Feature count mismatch. Expected {TOTAL_FEATURES}, got {features.Count}"
                );

            _logger.LogInformation($"✓ Flattened to {features.Count} features");
            return features;
        }

        /// <summary>
        /// Get expected feature count for validation
        /// </summary>
        public int GetExpectedFeatureCount()
        {
            return TOTAL_FEATURES;
        }
    }
}
