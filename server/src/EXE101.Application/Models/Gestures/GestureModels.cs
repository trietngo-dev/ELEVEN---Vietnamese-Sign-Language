namespace EXE101.Application.Models.Gestures;

/// <summary>
/// Represents a single 3D keypoint from MediaPipe.
/// </summary>
public sealed class Keypoint
{
    public float X { get; set; }
    public float Y { get; set; }
    public float Z { get; set; }
    public float Visibility { get; set; }
}

/// <summary>
/// Represents all keypoints for one frame.
/// Pose (25) + Face (51) + LeftHand (21) + RightHand (21) = 118 points.
/// </summary>
public sealed class FrameKeypoints
{
    public List<Keypoint> Pose { get; set; } = new();
    public List<Keypoint> LeftHand { get; set; } = new();
    public List<Keypoint> Face { get; set; } = new();
    public List<Keypoint> RightHand { get; set; } = new();

    public bool IsValid()
        => Pose.Count == 25 && Face.Count == 51 && LeftHand.Count == 21 && RightHand.Count == 21;
}

public sealed class KeypointsInput
{
    public List<FrameKeypoints> Frames { get; set; } = new();

    public bool IsValid()
    {
        if (Frames.Count == 0)
        {
            return false;
        }

        return Frames.All(frame => frame.IsValid());
    }
}

public sealed class FeaturesExtractedResponse
{
    public List<float> Features { get; set; } = new();
    public int FrameCount { get; set; }
    public int TotalFeatures { get; set; }
    public string Status { get; set; } = "ready";
}

public sealed class PredictRequest
{
    public List<float> Features { get; set; } = new();
}

public sealed class PredictResponse
{
    public int PredictedId { get; set; }
    public string Label { get; set; } = "unknown";
    public float Confidence { get; set; }
    public Dictionary<int, float> Probabilities { get; set; } = new();
}

public sealed class BatchPredictRequest
{
    public List<List<float>> Frames { get; set; } = new();
}

public sealed class BatchPredictResponse
{
    public int PredictedId { get; set; }
    public string Label { get; set; } = "unknown";
    public float Confidence { get; set; }
    public Dictionary<int, float> Probabilities { get; set; } = new();
    public int FrameCount { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
