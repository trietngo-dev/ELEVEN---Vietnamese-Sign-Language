# Sign Language AI Backend - Setup Guide

## Prerequisites
- .NET 8.0 SDK
- Visual Studio / VS Code
- Your ONNX model file: `vsl_rf_model.onnx`
- Label mapping JSON file (or use the example provided)

## Quick Start

### 1. Place Model Files
Copy these files to the `AIModels` folder:
- `vsl_rf_model.onnx` - Your trained ONNX model
- `label_mapping.json` - ID to label mapping (or use example)

### 2. Restore Dependencies
```bash
dotnet restore
```

### 3. Build Project
```bash
dotnet build
```

### 4. Run Application
```bash
dotnet run
```

By default, the app runs at:
- HTTPS: `https://localhost:5001`
- HTTP: `http://localhost:5000`

### 5. Access Swagger UI
Navigate to: `https://localhost:5001/swagger`

## Project Structure

```
SignLanguageAI/
├── AIModels/
│   ├── vsl_rf_model.onnx         (Your ONNX model - must be here)
│   ├── label_mapping.json         (Your label mapping - must be here)
│   └── API_DOCUMENTATION.md
│
├── Controllers/
│   └── GestureController.cs       (API endpoints)
│
├── Models/
│   ├── PredictRequest.cs          (Input model)
│   ├── PredictResponse.cs         (Output model)
│   └── ErrorViewModel.cs
│
├── Services/
│   └── OnnxGestureService.cs      (ONNX inference logic)
│
├── Program.cs                     (Application startup)
└── SignLanguageAI.csproj
```

## Configuration

### CORS Settings
Currently allows all origins. To restrict in production:
Edit `Program.cs` CORS policy:
```csharp
policy.WithOrigins("https://yourdomain.com")
      .AllowAnyMethod()
      .AllowAnyHeader();
```

### Logging
Logging is configured to console. To use file logging, add in Program.cs:
```csharp
builder.Logging.AddFile("logs/app.log");
```

## API Endpoints

### Health Check
```
GET /api/gesture/health
```

### Get Model Info
```
GET /api/gesture/model-info
```
Returns input/output names, expected features, and all labels.

### Predict Gesture
```
POST /api/gesture/predict
Content-Type: application/json

{
  "features": [0.1, 0.2, ..., -0.3]  // Must be exactly 20,640 floats
}
```

## Testing

### Method 1: Using Swagger UI
1. Run `dotnet run`
2. Go to `https://localhost:5001/swagger`
3. Test endpoints interactively

### Method 2: Using Postman
1. Import endpoints from Swagger
2. Create POST request to `/api/gesture/predict`
3. Add sample features in body

### Method 3: Using cURL
```bash
curl -X POST https://localhost:5000/api/gesture/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [0.1, 0.2, ..., -0.3]}'
```

## Common Issues

### Issue 1: Model Not Found
**Error**: `FileNotFoundException: Không tìm thấy model`
**Solution**: Ensure `vsl_rf_model.onnx` is in the `AIModels` folder

### Issue 2: Label Mapping Not Found
**Error**: `FileNotFoundException: Không tìm thấy label mapping`
**Solution**: Ensure `label_mapping.json` is in the `AIModels` folder

### Issue 3: Wrong Feature Count
**Error**: `Model cần đúng 20640 features, nhưng nhận X`
**Solution**: Frontend must send exactly 20,640 features (80 frames × 258 per frame)

### Issue 4: Invalid JSON Format
**Error**: `Features không được để rỗng`
**Solution**: Check JSON format, features must be an array of numbers

### Issue 5: Model Output Type Unknown
**Error**: `Output model không phải tensor<int> hoặc tensor<long>`
**Solution**: Verify ONNX export settings, output should be integer class ID

## Performance Tips

1. **Model Loading**: Model is loaded once at startup (singleton pattern)
2. **Inference Speed**: Depends on model size and CPU/GPU
3. **Memory**: Keeps minimal memory footprint
4. **Caching**: Consider caching predictions if same inputs repeat

## For Python Developer

To export your model correctly:
1. Ensure input shape is [1, 20640] (batch_size=1, features=20640)
2. Output should be int64 tensor with predicted class ID
3. Create label mapping JSON: `{"0": "label1", "1": "label2", ...}`

## Next Steps

1. Place your actual model files in `AIModels/`
2. Update `label_mapping.json` with your real labels
3. Test with sample data from your Python training set
4. Deploy to your hosting platform

## Support

For issues with:
- **ONNX Runtime**: See https://github.com/microsoft/onnxruntime
- **ASP.NET Core**: See https://docs.microsoft.com/dotnet
