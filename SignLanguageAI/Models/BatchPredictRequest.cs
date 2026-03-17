namespace SignLanguageAI.Models
{
    /// <summary>
    /// Request to predict from batch of frames (80 frames already flattened to features)
    /// Each frame: 258 features (33 pose*4 + 21 hand*3 + 21 hand*3)
    /// Total: 80 frames * 258 = 20,640 features
    /// </summary>
    public class BatchPredictRequest
    {
        /// <summary>
        /// List of 80 frames, each frame is 258 features
        /// If less than 80: will be zero-padded
        /// If more than 80: will be truncated
        /// </summary>
        public List<List<float>> Frames { get; set; } = new();

        /// <summary>
        /// Validate batch structure
        /// </summary>
        public bool IsValid()
        {
            if (Frames == null || Frames.Count == 0)
                return false;

            // Each frame should have 258 features (or be zero-padded later)
            return Frames.All(f => f != null && f.Count > 0);
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
    /// Request to predict from keypoints (80 frames of MediaPipe keypoints)
    /// </summary>
    public class BatchKeypointsRequest
    {
        /// <summary>
        /// 80 frames of raw keypoints from MediaPipe
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
