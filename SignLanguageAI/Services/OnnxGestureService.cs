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

        public (int predictedId, string label, float confidence, Dictionary<int, float> probabilities) Predict(List<float> features)
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

                var resultList = results.ToList();
                int predictedId = -1;
                float confidence = 0f;
                var probabilities = new Dictionary<int, float>();

                // Initialize probabilities with all labels = 0
                foreach (var kvp in _labelMap!)
                {
                    probabilities[kvp.Key] = 0f;
                }

                // Extract predicted class ID and probabilities from outputs
                foreach (var output in resultList)
                {
                    try
                    {
                        // Try to extract as class ID (long or int)
                        try
                        {
                            var longTensor = output.AsTensor<long>();
                            if (predictedId == -1)
                                predictedId = (int)longTensor[0];
                        }
                        catch
                        {
                            var intTensor = output.AsTensor<int>();
                            if (predictedId == -1)
                                predictedId = intTensor[0];
                        }
                    }
                    catch
                    {
                        try
                        {
                            // Try to extract as probabilities (float array)
                            var floatTensor = output.AsTensor<float>();
                            var dims = floatTensor.Dimensions;

                            if (dims.Length > 0 && dims[0] == 1)
                            {
                                // Batch size is 1, get the probabilities
                                var numClasses = dims.Length > 1 ? dims[1] : floatTensor.Length;
                                for (int i = 0; i < Math.Min(numClasses, _labelMap!.Count); i++)
                                {
                                    if (i < _labelMap!.Count)
                                    {
                                        // Access tensor value using indexer
                                        var probValue = floatTensor[0, i];
                                        probabilities[i] = probValue;
                                    }
                                }
                            }
                        }
                        catch
                        {
                            // Skip this output if it's not recognizable
                            _logger.LogWarning($"Could not parse ONNX output: {output.Name}");
                        }
                    }
                }

                // If no predicted ID found, throw error
                if (predictedId == -1)
                    throw new Exception("Model output not recognized. Expected class ID output.");

                // Calculate confidence as max probability
                if (probabilities.Any(p => p.Value > 0))
                {
                    confidence = probabilities.Values.Max();
                }
                else
                {
                    // Fallback: if no probabilities, set confidence = 1.0 for predicted class
                    confidence = 1.0f;
                    probabilities[predictedId] = 1.0f;
                }

                var label = _labelMap.TryGetValue(predictedId, out var value)
                    ? value
                    : "unknown";

                _logger.LogInformation($"✓ Prediction: ID={predictedId}, Label={label}, Confidence={confidence:F4}");

                return (predictedId, label, confidence, probabilities);
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error during prediction: {ex.Message}");
                throw;
            }
        }
    }
}
