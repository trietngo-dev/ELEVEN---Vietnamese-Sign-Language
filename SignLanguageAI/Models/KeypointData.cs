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
    /// MediaPipe structure: Pose (25) + Face (51) + LeftHand (21) + RightHand (21) = 118 points
    /// </summary>
    public class FrameKeypoints
    {
        /// <summary>
        /// Body pose keypoints (9 points - upper body only)
        /// Including: head, shoulders, arms, torso only (NO legs/ankles)
        /// </summary>
        public List<Keypoint> Pose { get; set; } = new();

        /// <summary>
        /// Left hand keypoints (21 points)
        /// Including: wrist, palm, fingers
        /// </summary>
        public List<Keypoint> LeftHand { get; set; } = new();

        /// <summary>
        /// Face keypoints (51 points)
        /// </summary>
        public List<Keypoint> Face { get; set; } = new();

        /// <summary>
        /// Right hand keypoints (21 points)
        /// Including: wrist, palm, fingers
        /// </summary>
        public List<Keypoint> RightHand { get; set; } = new();

        /// <summary>
        /// Validates structure: 9 pose + 51 face + 21 left + 21 right = 102 total
        /// </summary>
        public bool IsValid()
        {
            return Pose.Count == 9 && Face.Count == 51 && LeftHand.Count == 21 && RightHand.Count == 21;
        }

        /// <summary>
        /// Get total feature count for this frame (should be 306)
        /// All points use x,y,z only (no visibility):
        /// 9*3 + 51*3 + 21*3 + 21*3 = 27 + 153 + 63 + 63 = 306
        /// </summary>
        public int GetFeatureCount()
        {
            return (Pose.Count * 3) + (Face.Count * 3) + (LeftHand.Count * 3) + (RightHand.Count * 3);
        }
    }

    /// <summary>
    /// Request body for feature extraction from raw keypoints
    /// Frontend sends this: extracted keypoints from camera video
    /// </summary>
    public class KeypointsInput
    {
        /// <summary>
        /// List of frame keypoints (usually 50 frames)
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
        /// Get total expected features (usually 50 * 306 = 15,300)
        /// </summary>
        public int GetExpectedFeatureCount()
        {
            return Frames.Count * 306;
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
