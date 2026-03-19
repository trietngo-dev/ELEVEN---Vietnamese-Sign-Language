using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Gestures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public sealed class GestureController(
    IGesturePredictionService gesturePredictionService,
    IFeatureExtractionService featureExtractionService,
    IFrameBufferService frameBufferService,
    ILogger<GestureController> logger) : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health()
        => Ok(new { status = "OK", timestamp = DateTime.UtcNow });

    [HttpGet("model-info")]
    public IActionResult ModelInfo()
    {
        try
        {
            if (gesturePredictionService.LabelMap.Count == 0)
            {
                return StatusCode(503, new
                {
                    error = "Model not loaded",
                    message = "Place vsl_rf_model.onnx and label_mapping.json in AIModels folder"
                });
            }

            return Ok(new
            {
                inputName = gesturePredictionService.InputName,
                outputName = gesturePredictionService.OutputName,
                expectedFeatureLength = gesturePredictionService.ExpectedFeatureLength,
                labels = gesturePredictionService.LabelMap,
                totalLabels = gesturePredictionService.LabelMap.Count,
                status = "ready"
            });
        }
        catch (FileNotFoundException ex)
        {
            logger.LogError(ex, "Gesture model files not found");
            return StatusCode(503, new { error = ex.Message });
        }
    }

    [HttpGet("status")]
    public IActionResult Status()
    {
        try
        {
            var labelCount = gesturePredictionService.LabelMap.Count;
            return Ok(new
            {
                status = labelCount > 0 ? "Ready" : "Setup required",
                modelLoaded = labelCount > 0,
                labelCount,
                expectedFeatures = labelCount > 0 ? gesturePredictionService.ExpectedFeatureLength : 0,
                endpoints = new
                {
                    health = "/api/gesture/health",
                    status = "/api/gesture/status",
                    modelInfo = "/api/gesture/model-info",
                    predict = "/api/gesture/predict",
                    extractFeatures = "/api/gesture/extract-features",
                    predictBatch = "/api/gesture/predict-batch",
                    addFrame = "/api/gesture/add-frame"
                }
            });
        }
        catch (FileNotFoundException ex)
        {
            return StatusCode(503, new { status = "Setup required", error = ex.Message });
        }
    }

    [HttpPost("extract-features")]
    public IActionResult ExtractFeatures([FromBody] KeypointsInput? request)
    {
        try
        {
            if (request?.Frames == null || request.Frames.Count == 0)
            {
                return BadRequest(new
                {
                    error = "Frames cannot be empty",
                    expectedFrames = 80,
                    receivedFrames = request?.Frames?.Count ?? 0
                });
            }

            var features = featureExtractionService.ExtractFeatures(request);
            return Ok(new FeaturesExtractedResponse
            {
                Features = features,
                FrameCount = request.Frames.Count,
                TotalFeatures = features.Count,
                Status = "ready"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error extracting features");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("predict")]
    public IActionResult Predict([FromBody] PredictRequest? request)
    {
        try
        {
            if (request?.Features == null || request.Features.Count == 0)
            {
                return BadRequest(new
                {
                    error = "Features cannot be empty",
                    expectedCount = featureExtractionService.GetExpectedFeatureCount(),
                    receivedCount = request?.Features?.Count ?? 0
                });
            }

            var result = gesturePredictionService.Predict(request.Features);
            if (result.Confidence < 0.70f || string.Equals(result.Label, "khonglamgi", StringComparison.OrdinalIgnoreCase))
            {
                return Ok(new
                {
                    word = "",
                    message = "Chua ro cu chi"
                });
            }

            return Ok(new
            {
                word = result.Label,
                confidence = result.Confidence
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (FileNotFoundException ex)
        {
            return StatusCode(503, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Prediction error");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("predict-batch")]
    public IActionResult PredictBatch([FromBody] BatchPredictRequest? request)
    {
        try
        {
            if (request?.Frames == null || request.Frames.Count == 0)
            {
                return BadRequest(new
                {
                    error = "Frames cannot be empty",
                    expectedFrames = 80,
                    receivedFrames = request?.Frames?.Count ?? 0
                });
            }

            var flattenedFeatures = request.Frames.Where(frame => frame is not null).SelectMany(frame => frame).ToList();
            var expectedFeatures = featureExtractionService.GetExpectedFeatureCount();

            while (flattenedFeatures.Count < expectedFeatures)
            {
                flattenedFeatures.Add(0f);
            }

            if (flattenedFeatures.Count > expectedFeatures)
            {
                flattenedFeatures = flattenedFeatures.Take(expectedFeatures).ToList();
            }

            var result = gesturePredictionService.Predict(flattenedFeatures);
            return Ok(new BatchPredictResponse
            {
                PredictedId = result.PredictedId,
                Label = result.Label,
                Confidence = result.Confidence,
                Probabilities = result.Probabilities,
                FrameCount = request.Frames.Count,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (FileNotFoundException ex)
        {
            return StatusCode(503, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Batch prediction error");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("add-frame")]
    public IActionResult AddFrame([FromBody] FrameKeypoints? frame)
    {
        try
        {
            if (frame is null || !frame.IsValid())
            {
                return BadRequest(new
                {
                    error = "Frame is invalid",
                    expected = "9 pose + 51 face + 21 left hand + 21 right hand (306 features total)"
                });
            }

            frameBufferService.AddFrame(frame);
            var stats = frameBufferService.GetStats();

            if (!stats.IsReady)
            {
                return StatusCode(202, new
                {
                    status = "Buffering",
                    currentFrames = stats.CurrentCount,
                    maxFrames = stats.MaxCapacity,
                    progress = $"{stats.CurrentCount * 100 / stats.MaxCapacity}%"
                });
            }

            var features = frameBufferService.GetFlattenedFeatures();
            var result = gesturePredictionService.Predict(features);
            frameBufferService.Clear();

            return Ok(new
            {
                status = "Prediction Ready",
                predictedId = result.PredictedId,
                label = result.Label,
                confidence = result.Confidence,
                probabilities = result.Probabilities,
                frameCount = stats.MaxCapacity
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Add frame error");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("translate-sentence")]
    public async Task<IActionResult> TranslateSentence(
        [FromBody] TranslateSentenceRequest request,
        [FromServices] IGeminiTranslationService geminiTranslationService)
    {
        if (request?.Words == null || request.Words.Count == 0)
        {
            return BadRequest(new { error = "Words array cannot be empty" });
        }

        var filteredWords = request.Words
            .Where(w => !string.Equals(w, "ngoiim", StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (filteredWords.Count == 0)
        {
            return Ok(new { sentence = "" });
        }

        var sentence = await geminiTranslationService.PolishSentenceAsync(filteredWords);
        return Ok(new { sentence });
    }
}
