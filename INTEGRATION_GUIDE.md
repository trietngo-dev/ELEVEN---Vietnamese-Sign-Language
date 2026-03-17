# Integration Guide: Adding Your Model Files

## Step-by-Step Integration

### ✅ Prerequisites
- [ ] You have `vsl_rf_model.onnx` file
- [ ] You have `label_mapping.json` file  
- [ ] Project builds successfully (`dotnet build` returns no errors)

---

## Step 1: Add ONNX Model File

### Location
```
d:\ki7\EXE101\SignLanguageAI\SignLanguageAI\AIModels\
```

### What to do
1. Navigate to: `SignLanguageAI\AIModels\` folder
2. Copy your `vsl_rf_model.onnx` file here
3. File should be at: `SignLanguageAI\AIModels\vsl_rf_model.onnx`

### Verify
```bash
cd SignLanguageAI
ls AIModels/vsl_rf_model.onnx
# Should show: vsl_rf_model.onnx (file exists)
```

---

## Step 2: Add Label Mapping File

### Current Content
There's an example `label_mapping.json` already in place:
```json
{
  "0": "xin_chao",
  "1": "cam_on",
  "2": "bac_si",
  "3": "gia_dinh",
  "4": "nhan_vien",
  "5": "thu_vien"
}
```

### What to do
**Option A: Use your own labels**
1. Create/locate your `label_mapping.json` file
2. Ensure format is: `{"0": "label1", "1": "label2", ...}`
3. Replace the example file at: `SignLanguageAI\AIModels\label_mapping.json`

**Option B: Use example labels**
- Keep the current file as-is
- Update the labels dictionary based on your model

### Verify Format
Your JSON must look like:
```json
{
  "0": "gesture_one",
  "1": "gesture_two",
  "2": "gesture_three",
  ...
}
```

**NOT like this** ❌:
```json
{
  "gesture_one": 0,
  "gesture_two": 1
}
```

---

## Step 3: Verify Model Metadata

### Run Application
```bash
cd d:\ki7\EXE101\SignLanguageAI\SignLanguageAI
dotnet run
```

Expected output:
```
Building...
info: Building...
info: Application started. Press Ctrl+C to exit.
Listening on https://localhost:5001
```

### Test Model Info Endpoint
Open browser and go to:
```
https://localhost:5001/swagger
```

Or curl:
```bash
curl https://localhost:5001/api/gesture/model-info
```

### Expected Response
```json
{
  "inputName": "float_input",
  "outputName": "output_label",
  "expectedFeatureLength": 20640,
  "labels": {
    "0": "xin_chao",
    "1": "cam_on",
    ...
  },
  "totalLabels": 6
}
```

### Possible Issues & Fixes

❌ **Error**: `FileNotFoundException: vsl_rf_model.onnx not found`
- ✅ **Fix**: Check if file is in `AIModels\` folder exactly named `vsl_rf_model.onnx`

❌ **Error**: `FileNotFoundException: label_mapping.json not found`
- ✅ **Fix**: Check if file is in `AIModels\` folder exactly named `label_mapping.json`

❌ **Error**: `Cannot parse label_mapping.json`
- ✅ **Fix**: Validate JSON format - use https://jsonlint.com/

❌ **Error**: `Output model cannot be cast to int64`
- ✅ **Fix**: Your ONNX model output might be different. Contact your data scientist.

---

## Step 4: Compare Python vs C# Predictions

### Python Side (Your Training Environment)

Run this in your Jupyter notebook:
```python
import json
import numpy as np
from sklearn.externals import joblib

# Load your trained model
model = joblib.load('vsl_rf_model.pkl')

# Get a test sample from your test set
sample = X_test[0]  # Single sample with shape (20640,)

# Make prediction
pred = model.predict([sample])
pred_id = pred[0]

print(f"✓ Python Prediction ID: {pred_id}")
print(f"✓ Python Label: {label_mapping[str(pred_id)]}")

# Export sample for C# testing
sample_features = sample.astype(float).tolist()
print(f"✓ Features count: {len(sample_features)}")

# Save as JSON
with open('sample_test.json', 'w') as f:
    json.dump({"features": sample_features}, f)

print("✓ Saved sample_test.json")
```

### C# Side (Your Backend)

1. **Copy the sample file**:
   - Copy `sample_test.json` from Python to a temporary location
   - Open it and copy the entire "features" array

2. **Use Swagger to test**:
   - Navigate to `https://localhost:5001/swagger`
   - Find POST `/api/gesture/predict`
   - Paste the entire request body:
   ```json
   {
     "features": [0.1, 0.2, ... (all 20640 values) ...]
   }
   ```
   - Click "Execute"

3. **Check Response**:
   ```json
   {
     "predictedId": 1,
     "label": "cam_on",
     "confidence": 1.0
   }
   ```

### Comparison

| Aspect | Python | C# | Match? |
|--------|--------|----|----|
| Prediction ID | 1 | 1 | ✅ |
| Label | cam_on | cam_on | ✅ |

**Expected**: IDs should match exactly! If they don't, there's a data/model mismatch.

---

## Step 5: Handle Common Scenarios

### Scenario A: Model has different input name
If error says: `Input name "features" not found`
- Your model uses a different input name
- Fix: Edit `OnnxGestureService.cs` line 32
- The code will auto-detect it from metadata

### Scenario B: Model outputs probabilities
If your model outputs probability scores instead of class IDs:
- Update `OnnxGestureService.cs` to extract probabilities
- Modify confidence calculation (lines 110-114)

### Scenario C: Labels mismatch
If `KeyNotFoundException` when predicting:
- Your model outputs ID not in label_mapping.json
- Fix: Add missing IDs to label_mapping.json

---

## Step 6: Frontend Integration Ready

Once all tests pass, your backend is ready for frontend:

### Frontend Should Send
```javascript
const features = [/* 20640 features */];

const response = await fetch('https://backend-api.com/api/gesture/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ features: features })
});

const result = await response.json();
console.log(result.label); // Output: "xin_chao"
```

### Backend Endpoints Available
- `GET /api/gesture/health` - Check if backend is running
- `GET /api/gesture/model-info` - Get model metadata & labels
- `POST /api/gesture/predict` - Make prediction

---

## Deployment Checklist

Before production deployment:

- [ ] Model file present in AIModels/
- [ ] label_mapping.json present in AIModels/
- [ ] `dotnet build` succeeds
- [ ] `dotnet run` starts without errors
- [ ] `/model-info` endpoint returns correct info
- [ ] Predictions match Python output
- [ ] Update CORS policy (not AllowAll)
- [ ] Configure for HTTPS
- [ ] Set up logging
- [ ] Add rate limiting
- [ ] Document deployment URL for frontend

---

## Testing Matrix

| Test | Command | Expected | Status |
|------|---------|----------|--------|
| Build | `dotnet build` | Build succeeded | ✅ |
| Health | `GET /health` | 200 OK | ✅ |
| Model Info | `GET /model-info` | Shows metadata | ✅ |
| Predict | `POST /predict` | Returns label | ✅ |
| CORS | POST from frontend | Allowed | ✅ |

---

## Performance Benchmarks

After integration, you can expect:

| Metric | Value |
|--------|-------|
| Inference Time | 5-50ms (depends on model) |
| Memory Usage | 50-200MB |
| Startup Time | 2-5 seconds |
| Max Concurrent | CPU-dependent |

---

## Next Actions

1. **Immediate**:
   - [ ] Add your model and label files
   - [ ] Verify with `/model-info`
   - [ ] Test prediction with sample

2. **Short term**:
   - [ ] Compare Python vs C# predictions
   - [ ] Document any differences
   - [ ] Integrate with frontend

3. **Production**:
   - [ ] Update CORS policy
   - [ ] Add authentication
   - [ ] Deploy to cloud/server
   - [ ] Monitor performance

---

## Support & Debugging

### Logs
Run with detailed logging:
```bash
dotnet run --verbosity diag
```

### Common Commands
```bash
# Clean build
dotnet clean
dotnet build

# Run with specific port
dotnet run --urls "https://localhost:6001"

# Publish release
dotnet publish -c Release
```

### Check File Permissions
```bash
# Linux/Mac
ls -la SignLanguageAI/AIModels/

# Windows
dir SignLanguageAI\AIModels\
```

---

**Ready to integrate your model!** 🚀

After setup, your backend will be fully operational and ready to serve predictions to your frontend application.
