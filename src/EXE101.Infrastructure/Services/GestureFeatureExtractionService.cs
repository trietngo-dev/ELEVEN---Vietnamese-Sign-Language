using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Gestures;
using Microsoft.Extensions.Logging;

namespace EXE101.Infrastructure.Services;

/// <summary>
/// Extracts 30,320 normalized features from MediaPipe keypoints.
/// </summary>
public sealed class GestureFeatureExtractionService(ILogger<GestureFeatureExtractionService> logger) : IFeatureExtractionService
{
    private const int MaxFrames = 50;
    private const int PosePoints = 9;
    private const int FacePoints = 51;
    private const int HandPoints = 21;
    private const int TotalFeatures = 15300; // 50 * (9*3 + 51*3 + 21*3 + 21*3) = 50 * 306 = 15300

    public List<float> ExtractFeatures(KeypointsInput input)
    {
        if (input.Frames.Count == 0)
        {
            throw new ArgumentException("Frames cannot be empty.");
        }

        if (input.Frames.Any(frame => !frame.IsValid()))
        {
            throw new ArgumentException("Invalid frame structure. Expected 9 pose, 51 face, 21 left hand, 21 right hand.");
        }

        var normalizedFrames = NormalizeFrames(input.Frames);
        var paddedFrames = PadFrames(normalizedFrames);
        var features = FlattenFrames(paddedFrames);

        logger.LogInformation("Extracted {FeatureCount} features from {FrameCount} frames", features.Count, input.Frames.Count);
        return features;
    }

    public int GetExpectedFeatureCount() => TotalFeatures;

    private static List<FrameKeypoints> NormalizeFrames(List<FrameKeypoints> frames)
    {
        var normalized = new List<FrameKeypoints>(frames.Count);

        foreach (var frame in frames)
        {
            if (frame.Pose.Count == 0)
            {
                throw new InvalidOperationException("Pose keypoints are empty.");
            }

            var nose = frame.Pose[0];
            var normalizedFrame = new FrameKeypoints
            {
                Pose = frame.Pose.Select(point => NormalizePoint(point, nose)).ToList(),
                Face = frame.Face.Select(point => NormalizePoint(point, nose)).ToList(),
                LeftHand = frame.LeftHand.Select(point => NormalizePoint(point, nose)).ToList(),
                RightHand = frame.RightHand.Select(point => NormalizePoint(point, nose)).ToList()
            };

            normalized.Add(normalizedFrame);
        }

        return normalized;
    }

    private static Keypoint NormalizePoint(Keypoint point, Keypoint nose)
    {
        return new Keypoint
        {
            X = point.X - nose.X,
            Y = point.Y - nose.Y,
            Z = point.Z - nose.Z
        };
    }

    private static List<FrameKeypoints> PadFrames(List<FrameKeypoints> frames)
    {
        var result = new List<FrameKeypoints>(MaxFrames);

        for (var i = 0; i < Math.Min(frames.Count, MaxFrames); i++)
        {
            result.Add(frames[i]);
        }

        while (result.Count < MaxFrames)
        {
            result.Add(new FrameKeypoints
            {
                Pose = Enumerable.Range(0, PosePoints).Select(_ => new Keypoint()).ToList(),
                Face = Enumerable.Range(0, FacePoints).Select(_ => new Keypoint()).ToList(),
                LeftHand = Enumerable.Range(0, HandPoints).Select(_ => new Keypoint()).ToList(),
                RightHand = Enumerable.Range(0, HandPoints).Select(_ => new Keypoint()).ToList()
            });
        }

        return result;
    }

    private static List<float> FlattenFrames(List<FrameKeypoints> frames)
    {
        var features = new List<float>(TotalFeatures);

        foreach (var frame in frames)
        {
            foreach (var point in frame.Pose)
            {
                features.Add(point.X);
                features.Add(point.Y);
                features.Add(point.Z);
            }

            foreach (var point in frame.Face)
            {
                features.Add(point.X);
                features.Add(point.Y);
                features.Add(point.Z);
            }

            foreach (var point in frame.LeftHand)
            {
                features.Add(point.X);
                features.Add(point.Y);
                features.Add(point.Z);
            }

            foreach (var point in frame.RightHand)
            {
                features.Add(point.X);
                features.Add(point.Y);
                features.Add(point.Z);
            }
        }

        if (features.Count != TotalFeatures)
        {
            throw new InvalidOperationException($"Feature count mismatch. Expected {TotalFeatures}, got {features.Count}.");
        }

        return features;
    }
}
