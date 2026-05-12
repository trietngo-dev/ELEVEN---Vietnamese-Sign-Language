namespace SignLanguageAI.Models
{
    /// <summary>
    /// Request to predict from batch of flattened frames.
    /// Protocol: 50 frames x 306 features/frame = 15,300 features.
    /// </summary>
    public class BatchPredictRequest
    {
        /// <summary>
        /// List of 50 frames, each frame is 306 features.
        /// </summary>
        public List<List<float>> Frames { get; set; } = new();

        /// <summary>
        /// Validate batch structure
        /// </summary>
        public bool IsValid()
        {
            if (Frames == null || Frames.Count == 0)
                return false;

            const int expectedFrames = 50;
            const int expectedFeaturesPerFrame = 306;
            return Frames.Count == expectedFrames && Frames.All(f => f != null && f.Count == expectedFeaturesPerFrame);
        }

        /// <summary>
        /// Get total feature count
        /// </summary>
        public int GetTotalFeatureCount()
        {
            return Frames.Sum(f => f?.Count ?? 0);
        }
    }

    /// <summary>
    /// Request to predict from keypoints (50 frames of MediaPipe keypoints)
    /// </summary>
    public class BatchKeypointsRequest
    {
        /// <summary>
        /// 50 frames of raw keypoints from MediaPipe
        /// </summary>
        public List<FrameKeypoints> Frames { get; set; } = new();

        /// <summary>
        /// Validate request
        /// </summary>
        public bool IsValid()
        {
            if (Frames == null || Frames.Count == 0)
                return false;

            return Frames.All(f => f.IsValid());
        }
    }

    /// <summary>
    /// Response from batch predict endpoint
    /// </summary>
    public class BatchPredictResponse
    {
        public int PredictedId { get; set; }
        public string Label { get; set; } = "unknown";
        public float Confidence { get; set; } = 0f;
        public Dictionary<int, float>? Probabilities { get; set; }
        public int FrameCount { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
