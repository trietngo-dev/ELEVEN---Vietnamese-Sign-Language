namespace EXE101.Application.Interfaces.Services;

public interface IGesturePredictionService
{
    int ExpectedFeatureLength { get; }
    string InputName { get; }
    string OutputName { get; }
    IReadOnlyDictionary<int, string> LabelMap { get; }

    (int PredictedId, string Label, float Confidence, Dictionary<int, float> Probabilities) Predict(List<float> features);
}
