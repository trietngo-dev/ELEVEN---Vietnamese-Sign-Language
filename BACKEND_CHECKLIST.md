# Backend Development Checklist & Next Steps

## ✅ Completed Backend Implementation

### Project Structure Created
- ✅ Controllers/
  - ✅ GestureController.cs - API endpoints
- ✅ Models/
  - ✅ PredictRequest.cs - Request model
  - ✅ PredictResponse.cs - Response model  
  - ✅ ErrorViewModel.cs - Error handling
- ✅ Services/
  - ✅ OnnxGestureService.cs - ONNX inference engine
- ✅ AIModels/
  - ✅ label_mapping.json (example)
  - ✅ API_DOCUMENTATION.md

### Dependencies & NuGet Packages
- ✅ Microsoft.ML.OnnxRuntime (v1.24.3)
- ✅ Swashbuckle.AspNetCore (Swagger)

### Configuration
- ✅ Program.cs updated with:
  - ONNX service registration
  - Swagger configuration
  - CORS policy
  - API controller routing

### Build Status
- ✅ Project builds successfully
- ✅ No compilation errors

---

## TODO: What You Need To Do

### Step 1: Add Your Model Files (REQUIRED)
**Location**: `SignLanguageAI\AIModels\`

Copy these files from your Python training pipeline:
1. **vsl_rf_model.onnx** - Export your trained model
2. **label_mapping.json** - Your label mapping (overwrite example if needed)

**How to check format**:
```
label_mapping.json should look like:
{
  "0": "gesture_name_1",
  "1": "gesture_name_2",
  ...
}
```

### Step 2: Verify Model Configuration
```bash
cd d:\ki7\EXE101\SignLanguageAI\SignLanguageAI
dotnet run
```

Then open: https://localhost:5001/swagger

Test GET `/api/gesture/model-info` 
- Should show your model's input/output info
- Should show all labels from label_mapping.json

### Step 3: Compare Python vs C# Output
**Python side** (run this in your training notebook):
```python
import numpy as np
from sklearn.externals import joblib
import json

# Load your trained model
model = joblib.load('vsl_rf_model.pkl')  # or however you saved it

# Get a test sample
sample = X_test[0]  # one sample with shape (20640,)

# Predict
pred = model.predict([sample])
print(f"Python Prediction: {pred[0]}")
print(f"Label: {label_mapping[str(pred[0])]}")

# Save for comparison
sample_list = sample.astype(float).tolist()
with open('sample_input.json', 'w') as f:
    json.dump({"features": sample_list}, f)
```

**C# side** (in your Postman/Swagger):
1. POST `/api/gesture/predict`
2. Copy the same data from sample_input.json as request body
3. Check if predicted ID matches Python output

### Step 4: Adjust Confidence Threshold (Optional)
In `OnnxGestureService.cs` line 114:
```csharp
float confidence = 1.0f;  // Currently placeholder
```

If your ONNX model outputs probabilities:
```csharp
// If model has probability output, use it
var probTensor = results.FirstOrDefault(r => r.Name == "probabilities");
if (probTensor != null)
{
    var probs = probTensor.AsTensor<float>();
    confidence = probs.Max();
}
```

### Step 5: Test with Frontend (Later)
Frontend should send POST requests to:
```
POST /api/gesture/predict
Content-Type: application/json
CORS: Enabled (already configured)

{
  "features": [0.1, 0.2, ... 20640 values ...]
}
```

### Step 6: Production Deployment
Before deploying:
1. [ ] Change CORS policy (don't use AllowAll)
2. [ ] Add proper logging
3. [ ] Add rate limiting
4. [ ] Use HTTPS only
5. [ ] Update appsettings.json for production

---

## Quick Test Commands

### Test 1: Build Project
```bash
cd d:\ki7\EXE101\SignLanguageAI\SignLanguageAI
dotnet build
```
**Expected**: Builds successfully

### Test 2: Run Application
```bash
dotnet run
```
**Expected**: Server starts at https://localhost:5001

### Test 3: Check Health
```bash
curl https://localhost:5001/api/gesture/health
```
**Expected**: 
```json
{"status":"OK","timestamp":"2026-03-17T..."}
```

### Test 4: Get Model Info
```bash
curl https://localhost:5001/api/gesture/model-info
```
**Expected**: Shows model metadata

### Test 5: Predict with Sample
Use Postman or Swagger to POST 20,640 features

---

## File Locations Reference

```
d:\ki7\EXE101\SignLanguageAI\
├── SignLanguageAI/                    # Main project folder
│   ├── AIModels/
│   │   ├── vsl_rf_model.onnx         ← PUT YOUR MODEL HERE
│   │   ├── label_mapping.json        ← PUT YOUR LABELS HERE
│   │   └── API_DOCUMENTATION.md      ← API Reference
│   │
│   ├── Controllers/
│   │   └── GestureController.cs      ← API Endpoints
│   │
│   ├── Models/
│   │   ├── PredictRequest.cs
│   │   ├── PredictResponse.cs
│   │   └── ErrorViewModel.cs
│   │
│   ├── Services/
│   │   └── OnnxGestureService.cs     ← Inference Logic
│   │
│   ├── Program.cs                    ← Startup Configuration
│   └── SignLanguageAI.csproj         ← NuGet Packages
│
└── SETUP_BACKEND.md                  ← Setup Instructions
```

---

## Common Debugging

### Problem: Model file not found
```
FileNotFoundException: Không tìm thấy model
```
**Solution**: Check if `vsl_rf_model.onnx` exists in `AIModels/` folder

### Problem: Feature count mismatch  
```
Model cần đúng 20640 features, nhưng nhận X
```
**Solution**: 
- Check if model input is actually 20640 features
- Verify front-end preprocessing is correct
- Use `/model-info` endpoint to confirm expected feature length

### Problem: Labels not found
```
KeyNotFoundException in label mapping
```
**Solution**: Ensure `label_mapping.json` has all label IDs your model outputs

---

## Related Files & Docs

- **API Docs**: `SignLanguageAI/AIModels/API_DOCUMENTATION.md`
- **Setup Guide**: `SETUP_BACKEND.md` (root level)
- **Plan/Requirements**: `plan.md` (original requirements)

---

## API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/gesture/health` | GET | Health check |
| `/api/gesture/model-info` | GET | Get model metadata |
| `/api/gesture/predict` | POST | Predict gesture |

---

## Important Reminders

1. **Model Format**: Your ONNX model should:
   - Take input shape [1, 20640]
   - Output integer class ID (int64 or int32)
   
2. **Labels**: JSON must have format: `{"0": "label", "1": "label", ...}`

3. **Frontend Data**: Must send exactly 20,640 features (80 frames × 258 features)

4. **Preprocessing**: Ensure frontend applies same preprocessing as your Python training:
   - Translation invariance (using Nose as origin)
   - Temporal normalization (80 frames with padding)

5. **CORS**: Currently allows all. Update for production!

---

## Next Meeting Agenda

- [ ] Share model files (vsl_rf_model.onnx + label_mapping.json)
- [ ] Compare Python vs C# predictions on same sample
- [ ] Integrate with frontend
- [ ] Production deployment

---

**Status**: ✅ Backend ready for model integration
**Date**: March 17, 2026
**Build Status**: ✅ Successful
