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
        private readonly ILogger<GestureController> _logger;

        public GestureController(OnnxGestureService onnxService, ILogger<GestureController> logger)
        {
            _onnxService = onnxService;
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
        /// <param name="request">Request chứa danh sách 20640 feature</param>
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
                        expectedCount = 20640,
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

                var (predictedId, label, confidence) = _onnxService.Predict(request.Features);

                var response = new PredictResponse
                {
                    PredictedId = predictedId,
                    Label = label,
                    Confidence = confidence
                };

                _logger.LogInformation($"Prediction successful: {label} (ID: {predictedId})");
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Validation error: {ex.Message}");
                return BadRequest(new { 
                    error = ex.Message,
                    expectedFeatures = 20640,
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
                    predict = "/api/gesture/predict"
                }
            });
        }
    }
}
