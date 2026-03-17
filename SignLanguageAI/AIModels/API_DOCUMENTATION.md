# API Documentation - Sign Language AI Backend

## Endpoints

### 1. GET /api/gesture/health
Kiểm tra trạng thái API
- **Response:** 200 OK
- **Body:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-17T10:30:45.123Z"
}
```

### 2. GET /api/gesture/model-info
Lấy thông tin chi tiết về model (input/output names, số lượng features, danh sách labels)
- **Response:** 200 OK
- **Body:**
```json
{
  "inputName": "float_input",
  "outputName": "output_label",
  "expectedFeatureLength": 20640,
  "labels": {
    "0": "xin_chao",
    "1": "cam_on",
    "2": "bac_si",
    "3": "gia_dinh",
    "4": "nhan_vien",
    "5": "thu_vien"
  },
  "totalLabels": 6
}
```

### 3. POST /api/gesture/predict
Dự đoán cử chỉ từ dữ liệu features

- **Request Body:**
```json
{
  "features": [0.12, 0.33, -0.04, ... (đúng 20640 giá trị) ... ]
}
```

- **Response (Success):** 200 OK
```json
{
  "predictedId": 1,
  "label": "cam_on",
  "confidence": 1.0
}
```

- **Response (Validation Error):** 400 Bad Request
```json
{
  "error": "Model cần đúng 20640 features, nhưng nhận 100."
}
```

- **Response (Server Error):** 500 Internal Server Error
```json
{
  "error": "Lỗi server: ..."
}
```

## How to Test with Postman/Swagger

### Step 1: Check Model Info
1. Start application: `dotnet run`
2. Navigate to `https://localhost:5001/swagger` (Swagger UI)
3. Click on GET `/api/gesture/model-info`
4. Execute and check the response

### Step 2: Test Health Endpoint
1. Click on GET `/api/gesture/health`
2. Execute

### Step 3: Test Predict (with sample data)
1. You need to get a real sample vector from Python (exactly 20640 features)
2. Click on POST `/api/gesture/predict`
3. Input sample body (fill with your 20640 features):
```json
{
  "features": [0.0, 0.1, 0.2, ... ]
}
```
4. Execute and check prediction result

## Error Handling

The API handles several types of errors:

1. **Missing Features** - Empty or null features list
2. **Wrong Feature Count** - Doesn't match expected 20640
3. **ONNX Load Error** - Model file not found or corrupted
4. **Label Mapping Error** - label_mapping.json invalid
5. **Prediction Error** - Internal ONNX runtime error

All errors return detailed messages to help with debugging.

## Important Notes for Frontend Developer

1. **Max Input Size**: Exactly 20,640 floats (80 frames × 258 features per frame)
2. **Feature Format**: Must be POST as JSON array of floats
3. **Labels**: Use the label mapping from `/model-info` endpoint
4. **Confidence**: Currently returns 1.0 for all predictions (can be enhanced with probability output from model)
