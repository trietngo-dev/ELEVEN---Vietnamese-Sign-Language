using EXE101.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using System.Text.Json;

namespace EXE101.Infrastructure.Services;

public sealed class GesturePredictionService : IGesturePredictionService
{
    private readonly ILogger<GesturePredictionService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _contentRootPath;
    private readonly object _lockObject = new();

    private InferenceSession? _session;
    private Dictionary<int, string>? _labelMap;
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
            return _labelMap ?? new Dictionary<int, string>();
        }
    }

    public (int PredictedId, string Label, float Confidence, Dictionary<int, float> Probabilities) Predict(List<float> features)
    {
        EnsureInitialized();

        if (_session == null || _labelMap == null)
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

        var tensor = new DenseTensor<float>(new[] { 1, _expectedFeatureLength });
        for (var i = 0; i < _expectedFeatureLength; i++)
        {
            tensor[0, i] = features[i];
        }

        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor(_inputName!, tensor)
        };

        using var results = _session.Run(inputs);
        var predictedId = -1;
        var probabilities = _labelMap.ToDictionary(kv => kv.Key, _ => 0f);

        foreach (var output in results)
        {
            if (TryReadClassId(output, ref predictedId))
            {
                continue;
            }

            TryReadProbabilities(output, probabilities);
        }

        if (predictedId == -1)
        {
            throw new InvalidOperationException("Could not parse ONNX output class id.");
        }

        var confidence = probabilities.Any(p => p.Value > 0)
            ? probabilities.Values.Max()
            : 1f;

        if (!probabilities.Any(p => p.Value > 0))
        {
            probabilities[predictedId] = 1f;
        }

        var label = _labelMap.TryGetValue(predictedId, out var value)
            ? value
            : "unknown";

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

            var modelPath = ResolvePath("GestureModel:ModelPath", "vsl_rf_model.onnx");
            var labelPath = ResolvePath("GestureModel:LabelPath", "label_mapping.json");

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
                         ?? throw new InvalidOperationException("Failed to parse label_mapping.json");

            _labelMap = rawMap.ToDictionary(kv => int.Parse(kv.Key), kv => kv.Value);
            _inputName = _session.InputMetadata.Keys.First();
            _outputName = _session.OutputMetadata.Keys.First();

            var inputMeta = _session.InputMetadata[_inputName];
            var dims = inputMeta.Dimensions;

            if (dims.Length < 2 || dims[^1] <= 0)
            {
                throw new InvalidOperationException("Invalid model input dimensions.");
            }

            _expectedFeatureLength = dims[^1];
            _isInitialized = true;

            _logger.LogInformation("Gesture model loaded. Input={InputName}, Output={OutputName}, Features={FeatureLength}, Labels={LabelCount}",
                _inputName, _outputName, _expectedFeatureLength, _labelMap.Count);
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

    private static bool TryReadClassId(DisposableNamedOnnxValue output, ref int predictedId)
    {
        try
        {
            var longTensor = output.AsTensor<long>();
            if (predictedId == -1)
            {
                predictedId = (int)longTensor[0];
            }

            return true;
        }
        catch
        {
            try
            {
                var intTensor = output.AsTensor<int>();
                if (predictedId == -1)
                {
                    predictedId = intTensor[0];
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
    }

    private void TryReadProbabilities(DisposableNamedOnnxValue output, Dictionary<int, float> probabilities)
    {
        try
        {
            var floatTensor = output.AsTensor<float>();
            var dims = floatTensor.Dimensions;

            if (dims.Length > 1 && dims[0] == 1)
            {
                var classCount = Math.Min(dims[1], probabilities.Count);
                for (var i = 0; i < classCount; i++)
                {
                    probabilities[i] = floatTensor[0, i];
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Skip non-probability output {OutputName}", output.Name);
        }
    }
}
