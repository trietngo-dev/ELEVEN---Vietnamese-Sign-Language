using EXE101.Application.Models.Gestures;

namespace EXE101.Application.Interfaces.Services;

public interface IFeatureExtractionService
{
    List<float> ExtractFeatures(KeypointsInput input);
    int GetExpectedFeatureCount();
}
