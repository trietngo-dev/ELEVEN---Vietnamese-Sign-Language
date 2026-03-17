namespace SignLanguageAI.Models
{
    /// <summary>
    /// Represents a single 3D keypoint from MediaPipe
    /// </summary>
    public class Keypoint
    {
        public float X { get; set; }            // X coordinate
        public float Y { get; set; }            // Y coordinate
        public float Z { get; set; }            // Z coordinate (depth)
        public float Visibility { get; set; }   // Confidence/Visibility [0-1]
    }

    /// <summary>
    /// Represents all keypoints for a single frame
    /// MediaPipe structure: Pose (33) + LeftHand (21) + RightHand (21) = 75 points
    /// </summary>
    public class FrameKeypoints
    {
        /// <summary>
        /// Body pose keypoints (33 points)
        /// Including: head, shoulders, arms, torso, legs, hands landmarks
        /// </summary>
        public List<Keypoint> Pose { get; set; } = new();

        /// <summary>
        /// Left hand keypoints (21 points)
        /// Including: wrist, palm, fingers
        /// </summary>
        public List<Keypoint> LeftHand { get; set; } = new();

        /// <summary>
        /// Right hand keypoints (21 points)
        /// Including: wrist, palm, fingers
        /// </summary>
        public List<Keypoint> RightHand { get; set; } = new();

        /// <summary>
        /// Validates structure: 33 pose + 21 left + 21 right = 75 total
        /// </summary>
        public bool IsValid()
        {
            return Pose.Count == 33 && LeftHand.Count == 21 && RightHand.Count == 21;
        }

        /// <summary>
        /// Get total feature count for this frame (should be 258)
        /// Each point: x, y, z, visibility = 4 values
        /// 75 points × 4 = 300, but we use x, y, z for hands (3 each) = 33*4 + 21*3 + 21*3 = 132+63+63 = 258
        /// </summary>
        public int GetFeatureCount()
        {
            return (Pose.Count * 4) + (LeftHand.Count * 3) + (RightHand.Count * 3);
        }
    }

    /// <summary>
    /// Request body for feature extraction from raw keypoints
    /// Frontend sends this: extracted keypoints from camera video
    /// </summary>
    public class KeypointsInput
    {
        /// <summary>
        /// List of frame keypoints (usually 80 frames)
        /// </summary>
        public List<FrameKeypoints> Frames { get; set; } = new();

        /// <summary>
        /// Validate that we have frames and each frame is valid
        /// </summary>
        public bool IsValid()
        {
            if (Frames == null || Frames.Count == 0)
                return false;

            return Frames.All(f => f.IsValid());
        }

        /// <summary>
        /// Get total expected features (usually 80 * 258 = 20,640)
        /// </summary>
        public int GetExpectedFeatureCount()
        {
            return Frames.Count * 258;
        }
    }

    /// <summary>
    /// Response from feature extraction endpoint
    /// </summary>
    public class FeaturesExtractedResponse
    {
        public List<float> Features { get; set; } = new();
        public int FrameCount { get; set; }
        public int TotalFeatures { get; set; }
        public string Status { get; set; } = "ready";
    }
}
