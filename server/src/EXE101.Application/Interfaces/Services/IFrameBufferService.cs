using EXE101.Application.Models.Gestures;

namespace EXE101.Application.Interfaces.Services;

public interface IFrameBufferService
{
    void AddFrame(FrameKeypoints frame);
    bool IsReady();
    int GetFrameCount();
    List<FrameKeypoints> GetBufferedFrames();
    List<float> GetFlattenedFeatures();
    void Clear();
    (int CurrentCount, int MaxCapacity, bool IsReady) GetStats();
}
