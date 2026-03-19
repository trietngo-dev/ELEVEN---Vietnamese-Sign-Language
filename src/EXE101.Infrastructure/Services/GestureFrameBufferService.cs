using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Gestures;
using Microsoft.Extensions.Logging;

namespace EXE101.Infrastructure.Services;

public sealed class GestureFrameBufferService(
    IFeatureExtractionService featureExtractionService,
    ILogger<GestureFrameBufferService> logger) : IFrameBufferService
{
    private readonly Queue<FrameKeypoints> _buffer = new();
    private readonly object _lockObject = new();
    private const int MaxFrames = 80;

    public void AddFrame(FrameKeypoints frame)
    {
        if (!frame.IsValid())
        {
            throw new ArgumentException("Invalid frame structure.", nameof(frame));
        }

        lock (_lockObject)
        {
            if (_buffer.Count >= MaxFrames)
            {
                _buffer.Dequeue();
            }

            _buffer.Enqueue(frame);
            if (_buffer.Count == MaxFrames)
            {
                logger.LogDebug("Frame buffer reached max capacity {MaxFrames}", MaxFrames);
            }
        }
    }

    public bool IsReady()
    {
        lock (_lockObject)
        {
            return _buffer.Count >= MaxFrames;
        }
    }

    public int GetFrameCount()
    {
        lock (_lockObject)
        {
            return _buffer.Count;
        }
    }

    public List<FrameKeypoints> GetBufferedFrames()
    {
        lock (_lockObject)
        {
            return _buffer.ToList();
        }
    }

    public List<float> GetFlattenedFeatures()
    {
        lock (_lockObject)
        {
            if (_buffer.Count == 0)
            {
                throw new InvalidOperationException("Frame buffer is empty.");
            }

            return featureExtractionService.ExtractFeatures(new KeypointsInput
            {
                Frames = _buffer.ToList()
            });
        }
    }

    public void Clear()
    {
        lock (_lockObject)
        {
            _buffer.Clear();
            logger.LogInformation("Frame buffer has been cleared");
        }
    }

    public (int CurrentCount, int MaxCapacity, bool IsReady) GetStats()
    {
        lock (_lockObject)
        {
            return (_buffer.Count, MaxFrames, _buffer.Count >= MaxFrames);
        }
    }
}
