using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using System.Text.Json;

namespace SignLanguageAI.Services
{
    public class OnnxGestureService
    {
        private InferenceSession? _session;
        private Dictionary<int, string>? _labelMap;
        private string? _inputName;
        private string? _outputName;
        private int _expectedFeatureLength = 0;
        private readonly ILogger<OnnxGestureService> _logger;
        private bool _isInitialized = false;
        private object _lockObject = new object();

        public OnnxGestureService(ILogger<OnnxGestureService> logger)
        {
            _logger = logger;
            _logger.LogInformation("✓ OnnxGestureService created (lazy initialization - model loads on first use)");
        }

        private void InitializeModel()
        {
            if (_isInitialized)
                return;

            lock (_lockObject)
            {
                if (_isInitialized)
                    return;

                try
                {
                    var modelPath = Path.Combine(Directory.GetCurrentDirectory(), "AIModels", "vsl_rf_model.onnx");
                    var labelPath = Path.Combine(Directory.GetCurrentDirectory(), "AIModels", "label_mapping.json");

                    if (!File.Exists(modelPath))
                    {
                        _logger.LogWarning($"⚠️  Model file not found: {modelPath}");
                        throw new FileNotFoundException($"Không tìm thấy model: {modelPath}");
                    }

                    if (!File.Exists(labelPath))
                    {
                        _logger.LogWarning($"⚠️  Label mapping file not found: {labelPath}");
                        throw new FileNotFoundException($"Không tìm thấy label mapping: {labelPath}");
                    }

                    _logger.LogInformation($"Loading ONNX model from: {modelPath}");
                    _session = new InferenceSession(modelPath);

                    _logger.LogInformation($"Loading label mapping from: {labelPath}");
                    var json = File.ReadAllText(labelPath);
                    var rawMap = JsonSerializer.Deserialize<Dictionary<string, string>>(json)
                                 ?? throw new Exception("Không đọc được label_mapping.json");

                    _labelMap = rawMap.ToDictionary(
                        kv => int.Parse(kv.Key),
                        kv => kv.Value
                    );

                    _inputName = _session.InputMetadata.Keys.First();
                    _outputName = _session.OutputMetadata.Keys.First();

                    var inputMeta = _session.InputMetadata[_inputName];
                    var dims = inputMeta.Dimensions;

                    if (dims.Length < 2)
                        throw new Exception("Input shape của model không hợp lệ. Cần ít nhất 2 chiều.");

                    _expectedFeatureLength = (int)dims[dims.Length - 1];

                    if (_expectedFeatureLength <= 0)
                        throw new Exception("Không xác định được số feature đầu vào từ model.");

                    _logger.LogInformation($"✓ Model loaded successfully!");
                    _logger.LogInformation($"  Input: {_inputName}");
                    _logger.LogInformation($"  Output: {_outputName}");
                    _logger.LogInformation($"  Expected Features: {_expectedFeatureLength}");
                    _logger.LogInformation($"  Available Labels: {_labelMap.Count}");
                    
                    _isInitialized = true;
                }
                catch (Exception ex)
                {
                    _logger.LogError($"❌ Error initializing model: {ex.Message}");
                    _isInitialized = true; // Mark to prevent retry
                    throw;
                }
            }
        }

        public int ExpectedFeatureLength
        {
            get
            {
                if (!_isInitialized)
                    InitializeModel();
                return _expectedFeatureLength;
            }
        }

        public string InputName
        {
            get
            {
                if (!_isInitialized)
                    InitializeModel();
                return _inputName ?? "unknown";
            }
        }

        public string OutputName
        {
            get
            {
                if (!_isInitialized)
                    InitializeModel();
                return _outputName ?? "unknown";
            }
        }

        public Dictionary<int, string> LabelMap
        {
            get
            {
                if (!_isInitialized)
                    InitializeModel();
                return _labelMap ?? new Dictionary<int, string>();
            }
        }

        public (int predictedId, string label, float confidence) Predict(List<float> features)
        {
            if (!_isInitialized)
                InitializeModel();

            if (_session == null || _labelMap == null)
                throw new InvalidOperationException("Model is not initialized. Check if AIModels/vsl_rf_model.onnx exists.");

            if (features == null || features.Count == 0)
                throw new ArgumentException("Features rỗng.");

            if (features.Count != _expectedFeatureLength)
                throw new ArgumentException(
                    $"Model cần đúng {_expectedFeatureLength} features, nhưng nhận {features.Count}."
                );

            try
            {
                var tensor = new DenseTensor<float>(new[] { 1, _expectedFeatureLength });

                for (int i = 0; i < _expectedFeatureLength; i++)
                {
                    tensor[0, i] = features[i];
                }

                var inputs = new List<NamedOnnxValue>
                {
                    NamedOnnxValue.CreateFromTensor(_inputName!, tensor)
                };

                using var results = _session.Run(inputs);

                var first = results.FirstOrDefault();

                if (first == null)
                    throw new Exception("Model không trả output.");

                int predictedId;

                try
                {
                    var longTensor = first.AsTensor<long>();
                    predictedId = (int)longTensor[0];
                }
                catch
                {
                    try
                    {
                        var intTensor = first.AsTensor<int>();
                        predictedId = intTensor[0];
                    }
                    catch
                    {
                        throw new Exception("Output model không phải tensor<int> hoặc tensor<long>. Cần kiểm tra lại ONNX export.");
                    }
                }

                var label = _labelMap.TryGetValue(predictedId, out var value)
                    ? value
                    : "unknown";

                float confidence = 1.0f;

                _logger.LogInformation($"Prediction: ID={predictedId}, Label={label}, Confidence={confidence}");

                return (predictedId, label, confidence);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi trong quá trình dự đoán: {ex.Message}");
                throw;
            }
        }
    }
}
