using EXE101.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using System.Text.Json;

namespace EXE101.Infrastructure.Services;

public sealed class GesturePredictionService : IGesturePredictionService
{
    private const int SequenceLength = 50;
    private const int FeaturesPerFrame = 306;
    private const int TotalFeatures = SequenceLength * FeaturesPerFrame;
    private const float ConfidenceThreshold = 0.7f;
    private const string RequiredInputName = "input";

    private readonly ILogger<GesturePredictionService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _contentRootPath;
    private readonly object _lockObject = new();

    private InferenceSession? _session;
    private Dictionary<string, string>? _classMap;
    private string? _inputName;
    private string? _outputName;
    private int _expectedFeatureLength;
    private bool _isInitialized;

    public GesturePredictionService(
        ILogger<GesturePredictionService> logger,
        IConfiguration configuration,
        Microsoft.AspNetCore.Hosting.IWebHostEnvironment hostEnvironment)
    {
        _logger = logger;
        _configuration = configuration;
        _contentRootPath = hostEnvironment.ContentRootPath;
        _logger.LogInformation("GesturePredictionService initialized (lazy model loading)");
    }

    public int ExpectedFeatureLength
    {
        get
        {
            EnsureInitialized();
            return _expectedFeatureLength;
        }
    }

    public string InputName
    {
        get
        {
            EnsureInitialized();
            return _inputName ?? "unknown";
        }
    }

    public string OutputName
    {
        get
        {
            EnsureInitialized();
            return _outputName ?? "unknown";
        }
    }

    public IReadOnlyDictionary<int, string> LabelMap
    {
        get
        {
            EnsureInitialized();
            if (_classMap == null)
            {
                return new Dictionary<int, string>();
            }

            var result = new Dictionary<int, string>();
            foreach (var item in _classMap)
            {
                if (int.TryParse(item.Key, out var classId))
                {
                    result[classId] = item.Value;
                }
            }

            return result;
        }
    }

    public (int PredictedId, string Label, float Confidence, Dictionary<int, float> Probabilities) Predict(List<float> features)
    {
        EnsureInitialized();

        if (_session == null || _classMap == null)
        {
            throw new InvalidOperationException("Model is not initialized.");
        }

        if (features.Count == 0)
        {
            throw new ArgumentException("Features cannot be empty.", nameof(features));
        }

        if (features.Count != _expectedFeatureLength)
        {
            throw new ArgumentException($"Model expects {_expectedFeatureLength} features but received {features.Count}.");
        }

        var tensor = new DenseTensor<float>(new[] { 1, SequenceLength, FeaturesPerFrame });
        for (var i = 0; i < features.Count; i++)
        {
            var frameIndex = i / FeaturesPerFrame;
            var featureIndex = i % FeaturesPerFrame;
            
            tensor[0, frameIndex, featureIndex] = features[i];
        }

        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor(RequiredInputName, tensor)
        };

        using var results = _session.Run(inputs);
        var outputArray = results.First().AsEnumerable<float>().ToArray();
        if (outputArray.Length == 0)
        {
            throw new InvalidOperationException("ONNX output is empty.");
        }

        var predictedId = 0;
        var confidence = outputArray[0];
        var probabilities = new Dictionary<int, float>(outputArray.Length)
        {
            [0] = outputArray[0]
        };

        for (var i = 1; i < outputArray.Length; i++)
        {
            var probability = outputArray[i];
            probabilities[i] = probability;

            if (probability > confidence)
            {
                confidence = probability;
                predictedId = i;
            }
        }

        var predictedKey = predictedId.ToString();
        var mappedLabel = _classMap.TryGetValue(predictedKey, out var value)
            ? value
            : "unknown";
        var label = confidence > ConfidenceThreshold ? mappedLabel : "unknown";

        _logger.LogInformation("PredictedId={PredictedId}, Label={Label}, Confidence={Confidence:F4}", predictedId, label, confidence);

        return (predictedId, label, confidence, probabilities);
    }

    private void EnsureInitialized()
    {
        if (_isInitialized)
        {
            return;
        }

        lock (_lockObject)
        {
            if (_isInitialized)
            {
                return;
            }

            var modelPath = ResolvePath("GestureModel:ModelPath", "sign_language_lstm.onnx");
            var labelPath = ResolvePath("GestureModel:LabelPath", "classes.json");

            if (!File.Exists(modelPath))
            {
                throw new FileNotFoundException($"Model file not found: {modelPath}");
            }

            if (!File.Exists(labelPath))
            {
                throw new FileNotFoundException($"Label mapping file not found: {labelPath}");
            }

            _session = new InferenceSession(modelPath);

            var json = File.ReadAllText(labelPath);
            var rawMap = JsonSerializer.Deserialize<Dictionary<string, string>>(json)
                         ?? throw new InvalidOperationException("Failed to parse classes.json");

            _classMap = rawMap;
            _inputName = RequiredInputName;
            _outputName = _session.OutputMetadata.Keys.First();

            if (!_session.InputMetadata.TryGetValue(RequiredInputName, out var inputMeta))
            {
                throw new InvalidOperationException($"Input node '{RequiredInputName}' not found in ONNX model.");
            }

            var dims = inputMeta.Dimensions;

            if (dims.Length != 3)
            {
                throw new InvalidOperationException("Invalid model input dimensions. Expected 3D input tensor.");
            }

            if (dims[1] > 0 && dims[1] != SequenceLength)
            {
                throw new InvalidOperationException($"Unexpected sequence length. Expected {SequenceLength}, got {dims[1]}.");
            }

            if (dims[2] > 0 && dims[2] != FeaturesPerFrame)
            {
                throw new InvalidOperationException($"Unexpected features per frame. Expected {FeaturesPerFrame}, got {dims[2]}.");
            }

            _expectedFeatureLength = TotalFeatures;
            _isInitialized = true;

            _logger.LogInformation("Gesture model loaded. Input={InputName}, Output={OutputName}, Features={FeatureLength}, Labels={LabelCount}",
                _inputName, _outputName, _expectedFeatureLength, _classMap.Count);
        }
    }

    private string ResolvePath(string configKey, string fileName)
    {
        var configuredPath = _configuration[configKey];
        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            var absoluteConfigured = Path.IsPathRooted(configuredPath)
                ? configuredPath
                : Path.GetFullPath(Path.Combine(_contentRootPath, configuredPath));

            if (File.Exists(absoluteConfigured))
            {
                return absoluteConfigured;
            }
        }

        var candidates = new[]
        {
            Path.Combine(_contentRootPath, "AIModels", fileName),
            Path.GetFullPath(Path.Combine(_contentRootPath, "..", "..", "SignLanguageAI", "AIModels", fileName)),
            Path.GetFullPath(Path.Combine(_contentRootPath, "..", "..", fileName))
        };

        foreach (var candidate in candidates)
        {
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }

        return candidates[0];
    }

}
