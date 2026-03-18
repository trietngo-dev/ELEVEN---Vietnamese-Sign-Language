using Microsoft.AspNetCore.Mvc;
using SignLanguageAI.Models;
using SignLanguageAI.Services;
using System.IO;

namespace SignLanguageAI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GestureController : ControllerBase
    {
        private readonly OnnxGestureService _onnxService;
        private readonly FeatureExtractionService _featureService;
        private readonly FrameBufferService _frameBufferService;
        private readonly GeminiTranslationService _geminiTranslationService;
        private readonly ILogger<GestureController> _logger;

        public GestureController(
            OnnxGestureService onnxService, 
            FeatureExtractionService featureService,
            FrameBufferService frameBufferService,
            GeminiTranslationService geminiTranslationService,
            ILogger<GestureController> logger)
        {
            _onnxService = onnxService;
            _featureService = featureService;
            _frameBufferService = frameBufferService;
            _geminiTranslationService = geminiTranslationService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy thông tin về model
        /// </summary>
        /// <returns>Chi tiết input/output của model</returns>
        [HttpGet("model-info")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult ModelInfo()
        {
            try
            {
                var labelCount = _onnxService.LabelMap.Count;
                
                if (labelCount == 0)
                {
                    return StatusCode(503, new { 
                        error = "Model not loaded",
                        message = "Place vsl_rf_model.onnx and label_mapping.json in AIModels/ folder",
                        expectedLocation = "AIModels/vsl_rf_model.onnx"
                    });
                }

                return Ok(new
                {
                    inputName = _onnxService.InputName,
                    outputName = _onnxService.OutputName,
                    expectedFeatureLength = _onnxService.ExpectedFeatureLength,
                    labels = _onnxService.LabelMap,
                    totalLabels = labelCount,
                    status = "ready"
                });
            }
            catch (FileNotFoundException ex)
            {
                _logger.LogError($"Model file not found: {ex.Message}");
                return StatusCode(503, new { 
                    error = "Model files not found",
                    message = ex.Message,
                    required_files = new[] {
                        "AIModels/vsl_rf_model.onnx",
                        "AIModels/label_mapping.json"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting model info: {ex.Message}");
                return StatusCode(500, new { error = "Server error: " + ex.Message });
            }
        }

        /// <summary>
        /// Dự đoán cử chỉ từ các feature
        /// </summary>
        /// <param name="request">Request chứa danh sách 15,300 feature</param>
        /// <returns>Kết quả dự đoán với ID, nhãn và độ tin cậy</returns>
        [HttpPost("predict")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult Predict([FromBody] PredictRequest? request)
        {
            try
            {
                // Validate request
                if (request == null)
                {
                    _logger.LogWarning("Predict called with null request");
                    return BadRequest(new { error = "Request body is required" });
                }

                if (request.Features == null || request.Features.Count == 0)
                {
                    _logger.LogWarning("Predict called with empty features");
                    return BadRequest(new { 
                        error = "Features array cannot be empty",
                        expectedCount = _featureService.GetExpectedFeatureCount(),
                        receivedCount = request.Features?.Count ?? 0
                    });
                }

                // Check if model is ready
                if (_onnxService.LabelMap.Count == 0)
                {
                    return StatusCode(503, new {
                        error = "Model not loaded",
                        message = "Place model files in AIModels/ folder",
                        required_files = new[] {
                            "AIModels/vsl_rf_model.onnx",
                            "AIModels/label_mapping.json"
                        }
                    });
                }

                _logger.LogInformation($"Processing prediction request with {request.Features.Count} features");

                var result = _onnxService.Predict(request.Features);

                if (result.confidence < 0.70f || string.Equals(result.label, "khonglamgi", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation($"Prediction filtered: Label={result.label}, Confidence={result.confidence:F4}");
                    return Ok(new
                    {
                        word = "",
                        message = "Chưa rõ cử chỉ"
                    });
                }

                _logger.LogInformation($"✓ Prediction accepted: {result.label} (Confidence: {result.confidence:F4})");
                return Ok(new
                {
                    word = result.label,
                    confidence = result.confidence
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Validation error: {ex.Message}");
                return BadRequest(new { 
                    error = ex.Message,
                    expectedFeatures = _featureService.GetExpectedFeatureCount(),
                    receivedFeatures = request?.Features?.Count ?? 0
                });
            }
            catch (FileNotFoundException ex)
            {
                _logger.LogError($"Model file not found: {ex.Message}");
                return StatusCode(503, new { 
                    error = "Model files not found",
                    message = ex.Message,
                    required_files = new[] {
                        "AIModels/vsl_rf_model.onnx",
                        "AIModels/label_mapping.json"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Prediction error: {ex.Message}");
                return StatusCode(500, new { error = $"Server error: {ex.Message}" });
            }
        }

        /// <summary>
        /// Translate isolated recognized words into a natural Vietnamese sentence using Gemini.
        /// </summary>
        /// <param name="request">List of recognized words from continuous sliding-window inference</param>
        [HttpPost("translate-sentence")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> TranslateSentence([FromBody] TranslateSentenceRequest? request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { error = "Request body is required" });
                }

                var words = request.Words ?? new List<string>();
                if (words.Count == 0)
                {
                    return Ok(new TranslateSentenceResponse
                    {
                        Sentence = string.Empty
                    });
                }

                var sentence = await _geminiTranslationService.TranslateWordsAsync(words, HttpContext.RequestAborted);

                return Ok(new TranslateSentenceResponse
                {
                    Sentence = sentence
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Gemini translation configuration error");
                return StatusCode(500, new { error = ex.Message });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Gemini translation HTTP error");
                return StatusCode(500, new { error = "Gemini translation failed", detail = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while translating sentence");
                return StatusCode(500, new { error = "Server error", detail = ex.Message });
            }
        }

        /// <summary>
        /// Kiểm tra trạng thái API
        /// </summary>
        [HttpGet("health")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Health()
        {
            return Ok(new { status = "OK", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// Kiểm tra setup status (model files required)
        /// </summary>
        [HttpGet("status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        public IActionResult Status()
        {
            var modelPath = Path.Combine(Directory.GetCurrentDirectory(), "AIModels", "vsl_rf_model.onnx");
            var labelPath = Path.Combine(Directory.GetCurrentDirectory(), "AIModels", "label_mapping.json");
            
            var modelExists = System.IO.File.Exists(modelPath);
            var labelExists = System.IO.File.Exists(labelPath);
            var isReady = modelExists && labelExists && _onnxService.LabelMap.Count > 0;

            if (!isReady)
            {
                return StatusCode(503, new
                {
                    status = "Setup required",
                    modelFileExists = modelExists,
                    modelFilePath = modelPath,
                    labelFileExists = labelExists,
                    labelFilePath = labelPath,
                    message = "Place vsl_rf_model.onnx and label_mapping.json in AIModels/ folder",
                    setup_instructions = new
                    {
                        step1 = "Copy vsl_rf_model.onnx to AIModels/ folder",
                        step2 = "Copy label_mapping.json to AIModels/ folder",
                        step3 = "Restart the application",
                        step4 = "Test with GET /api/gesture/model-info"
                    }
                });
            }

            return Ok(new
            {
                status = "Ready",
                modelLoaded = true,
                labelCount = _onnxService.LabelMap.Count,
                expectedFeatures = _onnxService.ExpectedFeatureLength,
                endpoints = new
                {
                    health = "/api/gesture/health",
                    status = "/api/gesture/status (this endpoint)",
                    modelInfo = "/api/gesture/model-info",
                    predict = "/api/gesture/predict",
                    extractFeatures = "/api/gesture/extract-features",
                    predictBatch = "/api/gesture/predict-batch",
                    translateSentence = "/api/gesture/translate-sentence"
                }
            });
        }

        /// <summary>
        /// Extract 15,300 normalized features from MediaPipe keypoints
        /// </summary>
        /// <param name="request">50 frames of keypoints (can be less, will be zero-padded)</param>
        /// <returns>15,300 normalized features ready for prediction</returns>
        [HttpPost("extract-features")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult ExtractFeatures([FromBody] KeypointsInput? request)
        {
            try
            {
                if (request == null || request.Frames == null || request.Frames.Count == 0)
                {
                    _logger.LogWarning("ExtractFeatures called with empty request");
                    return BadRequest(new
                    {
                        error = "Frames không được rỗng",
                        expectedFrames = 50,
                        receivedFrames = request?.Frames?.Count ?? 0
                    });
                }

                _logger.LogInformation($"Extracting features from {request.Frames.Count} frames");
                var features = _featureService.ExtractFeatures(request);

                var response = new FeaturesExtractedResponse
                {
                    Features = features,
                    FrameCount = request.Frames.Count,
                    TotalFeatures = features.Count,
                    Status = "ready"
                };

                _logger.LogInformation($"✓ Extracted {features.Count} features");
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Validation error: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error extracting features: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Predict gesture from batch of 50 flattened frames (15,300 features total)
        /// </summary>
        /// <param name="request">50 frames × 306 features each</param>
        /// <returns>Predicted gesture with probabilities</returns>
        [HttpPost("predict-batch")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult PredictBatch([FromBody] BatchPredictRequest? request)
        {
            try
            {
                if (request == null || request.Frames == null || request.Frames.Count == 0)
                {
                    _logger.LogWarning("PredictBatch called with empty request");
                    return BadRequest(new
                    {
                        error = "Frames không được rỗng",
                        expectedFrames = 50,
                        receivedFrames = request?.Frames?.Count ?? 0
                    });
                }

                if (!request.IsValid())
                {
                    return BadRequest(new
                    {
                        error = "Protocol mismatch. Expected exactly 50 frames and 306 features per frame.",
                        expectedFrames = 50,
                        expectedFeaturesPerFrame = 306,
                        expectedTotalFeatures = _featureService.GetExpectedFeatureCount(),
                        receivedFrames = request.Frames.Count,
                        receivedFrameSizes = request.Frames.Select(f => f?.Count ?? 0).ToList()
                    });
                }

                // Check if model is ready
                if (_onnxService.LabelMap.Count == 0)
                {
                    return StatusCode(503, new
                    {
                        error = "Model not loaded",
                        message = "Place model files in AIModels/ folder"
                    });
                }

                // Flatten batch frames into a single 1D feature array in protocol order.
                // Each frame is already flattened as [Pose, Face, LeftHand, RightHand] with 306 values.
                var flattenedFeatures = new List<float>(request.Frames.Count * 306);
                foreach (var frame in request.Frames)
                    flattenedFeatures.AddRange(frame);

                var expectedFeatures = _featureService.GetExpectedFeatureCount();

                if (flattenedFeatures.Count != expectedFeatures)
                {
                    throw new ArgumentException(
                        $"Protocol mismatch. Expected {expectedFeatures} features (50x306), got {flattenedFeatures.Count}."
                    );
                }

                _logger.LogInformation($"Processing batch prediction with {flattenedFeatures.Count} features from {request.Frames.Count} frames");

                var (predictedId, label, confidence, probabilities) = _onnxService.Predict(flattenedFeatures);

                var response = new BatchPredictResponse
                {
                    PredictedId = predictedId,
                    Label = label,
                    Confidence = confidence,
                    Probabilities = probabilities,
                    FrameCount = request.Frames.Count,
                    Timestamp = DateTime.UtcNow
                };

                _logger.LogInformation($"✓ Batch prediction: {label} (Confidence: {confidence:F4})");
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Validation error: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (FileNotFoundException ex)
            {
                _logger.LogError($"Model file not found: {ex.Message}");
                return StatusCode(503, new { error = "Model not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Batch prediction error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Add frame to real-time buffer and get prediction when ready
        /// </summary>
        [HttpPost("add-frame")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult AddFrame([FromBody] FrameKeypoints? frame)
        {
            try
            {
                if (frame == null || !frame.IsValid())
                {
                    _logger.LogWarning("AddFrame called with invalid frame");
                    return BadRequest(new
                    {
                        error = "Frame không hợp lệ",
                        expected = "9 pose + 51 face + 21 left hand + 21 right hand = 102 points"
                    });
                }

                _frameBufferService.AddFrame(frame);

                var (currentCount, maxCapacity, isReady) = _frameBufferService.GetStats();

                if (isReady)
                {
                    // Buffer full, perform prediction
                    _logger.LogInformation("Frame buffer full, performing prediction");
                    var features = _frameBufferService.GetFlattenedFeatures();
                    var (predictedId, label, confidence, probabilities) = _onnxService.Predict(features);

                    // Clear buffer for next gesture
                    _frameBufferService.Clear();

                    return Ok(new
                    {
                        status = "Prediction Ready",
                        predictedId,
                        label,
                        confidence,
                        probabilities,
                        frameCount = maxCapacity
                    });
                }
                else
                {
                    // Buffer not ready yet
                    return StatusCode(202, new
                    {
                        status = "Buffering",
                        currentFrames = currentCount,
                        maxFrames = maxCapacity,
                        progress = $"{(currentCount * 100 / maxCapacity)}%"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding frame: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
