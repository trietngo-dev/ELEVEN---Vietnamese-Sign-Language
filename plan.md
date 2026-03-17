1. Input model là bao nhiêu số?
Câu trả lời chính xác là: 20.640 số

Giải thích chi tiết (Công thức tính):
Mô hình yêu cầu đầu vào là một mảng 1 chiều (Flatten Array) được cấu thành từ:

Thời gian (Frames): Chúng ta đã chốt cứng MAX_FRAMES = 80.

Không gian (Features/Frame): Mỗi frame có 258 giá trị, bao gồm:

Pose (Cơ thể): 33 điểm x 4 (x, y, z, visibility) = 132 số.

Left Hand (Tay trái): 21 điểm x 3 (x, y, z) = 63 số.

Right Hand (Tay phải): 21 điểm x 3 (x, y, z) = 63 số.

Tổng cộng: 132 + 63 + 63 = 258 số/frame.

Tổng Input: 80 frames × 258 giá trị = 20.640 số.

(Lưu ý cho BE: Khi khai báo tensor trong C# Microsoft.ML.OnnxRuntime, shape của đầu vào sẽ là [1, 20640] - nghĩa là 1 batch, 20640 features).

Dựa trên script 02_normalize_data.py mà chúng ta vừa tạo, câu trả lời là CÓ làm Normalization (Chuẩn hóa), nhưng CHƯA làm Scaling (Co giãn).

Cụ thể những gì chúng ta đã làm và chưa làm:

✅ Những gì ĐÃ LÀM (Translation Invariance & Temporal Padding):

Dời gốc tọa độ (Spatial Normalization): Chúng ta đã lấy tọa độ của Mũi (Nose) làm gốc (0,0,0). Tất cả các điểm khác (vai, cùi chỏ, bàn tay) đều bị trừ đi tọa độ của Mũi.

Tác dụng: Xử lý được việc user đứng lệch sang trái, phải, cao, thấp trong khung hình.

Chuẩn hóa thời gian (Temporal Normalization): Cắt bớt nếu video dài hơn 80 frames, và bù số 0 (Zero-Padding) vào cuối nếu video ngắn hơn 80 frames.

❌ Những gì CHƯA LÀM (Scale Invariance):
Chúng ta chưa áp dụng Min-Max Scaling, Standard Scaler, hay chia theo khoảng cách của vai/wrist.

Vấn đề tiềm ẩn: Vì chưa scale độ lớn, nếu trong dataset UIT người mẫu đứng xa camera (tay nhỏ), nhưng user dùng thực tế lại đưa tay sát vào camera (tay to), hệ tọa độ sẽ chênh lệch về mặt biên độ, có thể làm giảm độ chính xác của Random Forest.

Output 1: Nhãn dự đoán (Predicted Label / Class ID)
Đây là kết quả quan trọng nhất. Nó trả về một mảng chứa một số nguyên duy nhất (thường là kiểu Int64). Số nguyên này chính là ID của từ vựng mà AI cho là đúng nhất.

Ví dụ: Nó trả về [0], hoặc [4].

Cách dùng: Lúc này, Backend C# sẽ lấy con số 4 đó, mở file label_mapping.json (mà team Python đã xuất ra) để tra cứu: "À, ID số 4 tương ứng với từ 'nhân viên'". Từ đó, BE mới biết mà trả chữ "nhân viên" về cho Frontend hoặc gửi cho Gemini.

2. Output 2: Xác suất / Độ tin cậy (Probabilities)
Đây là "vũ khí bí mật" giúp app của bạn trông thông minh và chuyên nghiệp như các app quốc tế. Nó trả về một danh sách (Dictionary/Map) chứa điểm số xác suất cho từng từ vựng một trong từ điển của bạn. Điểm số chạy từ 0.0 đến 1.0 (tương đương 0% đến 100%).

Ví dụ: Nó trả về { 0: 0.05, 1: 0.15, 2: 0.0, 3: 0.0, 4: 0.80 }

Ý nghĩa: AI đang bảo là: "Tôi chắc chắn 80% người dùng vừa múa chữ số 4 (nhân viên), 15% là chữ số 1, và 5% là chữ số 0".

Cách dùng: Team Backend nên dùng thông số này để thiết lập một Ngưỡng chấp nhận (Threshold). Ví dụ:

Nếu xác suất cao nhất > 0.70 (70%): Chấp nhận kết quả, in ra chữ "nhân viên".

Nếu xác suất cao nhất < 0.70 (Ví dụ người dùng múa quá nhanh, sai động tác, hoặc múa bậy bạ ngoài từ điển): Backend tự động từ chối và gửi thông báo về Frontend: "Cử chỉ chưa rõ ràng, vui lòng thực hiện lại!".

Điều này giúp hệ thống của bạn không bị "đoán mò" và trả về những kết quả ngớ ngẩn khi người dùng làm sai.

Tóm lại luồng xử lý trong Backend C# sẽ là:
Nhận mảng tọa độ -> Đưa vào ONNX -> Lấy ra ID và Xác suất -> Nếu Xác suất > 70% -> Tra file JSON lấy từ vựng -> Trả về Client.

2. Cấu trúc folder trong project .NET

Trong project của bạn, tạo như này:

SignLanguageAI
│
├── AIModels
│   ├── vsl_rf_model.onnx
│   ├── label_mapping.json
│   └── sample_input.json
│
├── Controllers
│   └── GestureController.cs
│
├── Models
│   ├── PredictRequest.cs
│   └── PredictResponse.cs
│
├── Services
│   └── OnnxGestureService.cs
│
├── Program.cs
└── SignLanguageAI.csproj

sample_input.json là file để test.

3. Cài package cần thiết

Mở terminal trong project:

dotnet add package Microsoft.ML.OnnxRuntime
4. Chuẩn bị file label_mapping.json

Bạn cần file map id sang từ.

Ví dụ đơn giản nhất:

{
  "0": "xin_chao",
  "1": "cam_on",
  "2": "bac_si",
  "3": "gia_dinh"
}

Nếu bạn của bạn đang có dạng ngược lại:

{
  "xin_chao": 0,
  "cam_on": 1
}

thì phải đổi sang dạng id -> label cho BE dễ dùng hơn.

5. Tạo model request/response
Models/PredictRequest.cs
namespace SignLanguageAI.Models
{
    public class PredictRequest
    {
        public List<float> Features { get; set; } = new();
    }
}
Models/PredictResponse.cs
namespace SignLanguageAI.Models
{
    public class PredictResponse
    {
        public int PredictedId { get; set; }
        public string Label { get; set; } = "unknown";
    }
}
6. Viết service chạy ONNX
Services/OnnxGestureService.cs

Dán nguyên file này:

using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using System.Text.Json;

namespace SignLanguageAI.Services
{
    public class OnnxGestureService
    {
        private readonly InferenceSession _session;
        private readonly Dictionary<int, string> _labelMap;
        private readonly string _inputName;
        private readonly string _outputName;
        private readonly int _expectedFeatureLength;

        public OnnxGestureService()
        {
            var modelPath = Path.Combine(Directory.GetCurrentDirectory(), "AIModels", "vsl_rf_model.onnx");
            var labelPath = Path.Combine(Directory.GetCurrentDirectory(), "AIModels", "label_mapping.json");

            if (!File.Exists(modelPath))
                throw new FileNotFoundException($"Không tìm thấy model: {modelPath}");

            if (!File.Exists(labelPath))
                throw new FileNotFoundException($"Không tìm thấy label mapping: {labelPath}");

            _session = new InferenceSession(modelPath);

            var json = File.ReadAllText(labelPath);
            var rawMap = JsonSerializer.Deserialize<Dictionary<string, string>>(json)
                         ?? throw new Exception("Không đọc được label_mapping.json");

            _labelMap = rawMap.ToDictionary(
                kv => int.Parse(kv.Key),
                kv => kv.Value
            );

            _inputName = _session.InputMetadata.Keys.First();

            // Ưu tiên output tensor label
            _outputName = _session.OutputMetadata.Keys.First();

            // Lấy shape input
            var inputMeta = _session.InputMetadata[_inputName];
            var dims = inputMeta.Dimensions;

            // Ví dụ shape [1, 20640] hoặc [-1, 20640]
            if (dims.Count < 2)
                throw new Exception("Input shape của model không hợp lệ. Cần ít nhất 2 chiều.");

            _expectedFeatureLength = dims[^1];

            if (_expectedFeatureLength <= 0)
                throw new Exception("Không xác định được số feature đầu vào từ model.");
        }

        public int ExpectedFeatureLength => _expectedFeatureLength;
        public string InputName => _inputName;
        public string OutputName => _outputName;

        public (int predictedId, string label) Predict(List<float> features)
        {
            if (features == null || features.Count == 0)
                throw new ArgumentException("Features rỗng.");

            if (features.Count != _expectedFeatureLength)
                throw new ArgumentException(
                    $"Model cần đúng {_expectedFeatureLength} features, nhưng nhận {features.Count}."
                );

            var tensor = new DenseTensor<float>(new[] { 1, _expectedFeatureLength });

            for (int i = 0; i < _expectedFeatureLength; i++)
            {
                tensor[0, i] = features[i];
            }

            var inputs = new List<NamedOnnxValue>
            {
                NamedOnnxValue.CreateFromTensor(_inputName, tensor)
            };

            using var results = _session.Run(inputs);

            // Trường hợp phổ biến: output là tensor<long> hoặc tensor<int64>
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

            return (predictedId, label);
        }
    }
}
7. Tạo controller
Controllers/GestureController.cs
using Microsoft.AspNetCore.Mvc;
using SignLanguageAI.Models;
using SignLanguageAI.Services;

namespace SignLanguageAI.Controllers
{
    [ApiController]
    [Route("api/gesture")]
    public class GestureController : ControllerBase
    {
        private readonly OnnxGestureService _onnxService;

        public GestureController(OnnxGestureService onnxService)
        {
            _onnxService = onnxService;
        }

        [HttpGet("model-info")]
        public IActionResult ModelInfo()
        {
            return Ok(new
            {
                inputName = _onnxService.InputName,
                outputName = _onnxService.OutputName,
                expectedFeatureLength = _onnxService.ExpectedFeatureLength
            });
        }

        [HttpPost("predict")]
        public IActionResult Predict([FromBody] PredictRequest request)
        {
            try
            {
                var (predictedId, label) = _onnxService.Predict(request.Features);

                return Ok(new PredictResponse
                {
                    PredictedId = predictedId,
                    Label = label
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    error = ex.Message
                });
            }
        }
    }
}
8. Đăng ký service trong Program.cs

Mở Program.cs, thêm:

using SignLanguageAI.Services;

và trước var app = builder.Build(); thêm:

builder.Services.AddSingleton<OnnxGestureService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

Nếu file bạn đã có sẵn mấy dòng này rồi thì chỉ cần thêm AddSingleton.

Phần map controller:

app.MapControllers();
9. Cách test đúng nhất
Test 1: kiểm tra model BE đọc được chưa

Chạy app:

dotnet run

Mở Swagger hoặc browser vào:

GET /api/gesture/model-info

Nếu đúng, bạn sẽ thấy kiểu này:

{
  "inputName": "float_input",
  "outputName": "output_label",
  "expectedFeatureLength": 20640
}

Nếu BE chạy tới đây là:

đã đọc được .onnx

đã đọc được .json

đã biết input length

Test 2: test predict bằng sample input

Bạn cần file AIModels/sample_input.json.

Format như này:

{
  "features": [0.12, 0.33, -0.04, 0.19, 0.28, -0.03]
}

Tất nhiên phải đủ đúng số lượng, ví dụ 20640 số.

Cách test bằng Swagger/Postman

POST /api/gesture/predict

Body:

{
  "features": [ ... đủ đúng số lượng ... ]
}

Response mong muốn:

{
  "predictedId": 1,
  "label": "cam_on"
}
10. Cách tạo sample_input.json để test chuẩn

Cách tốt nhất là nhờ bạn của bạn xuất 1 sample vector thật từ Python training pipeline.

Ví dụ Python:

import json
import numpy as np

# ví dụ X_test[0] là một sample đã đúng format model cần
sample = X_test[0].astype(float).tolist()

with open("sample_input.json", "w", encoding="utf-8") as f:
    json.dump({"features": sample}, f, ensure_ascii=False)

Sau đó copy file này vào:

AIModels/sample_input.json

Rồi bạn dùng đúng body đó để test vào BE.

Đây là cách test chuẩn nhất vì:

sample này là dữ liệu thật

bạn có thể so sánh Python predict và .NET predict có giống nhau không

11. Cách so sánh Python với .NET để biết BE đúng hay sai

Nhờ bạn của bạn chạy trong Python:

pred = model.predict([X_test[0]])
print(pred)
print(label_mapping[str(pred[0])])

Ví dụ Python ra:

1
cam_on

Sau đó gửi chính X_test[0] sang API .NET.

Nếu .NET cũng ra:

{
  "predictedId": 1,
  "label": "cam_on"
}

thì BE của bạn đúng.

12. Chỗ dễ lỗi nhất

Đây là các lỗi mình thấy chắc chắn sẽ gặp nếu không để ý:

Lỗi 1: FE gửi sai số lượng feature

Ví dụ model cần 20640 mà FE chỉ gửi 63.

=> sẽ fail ngay.

Lỗi 2: preprocessing không giống lúc train

Ví dụ train dùng normalized landmarks, nhưng FE gửi landmark thô.

=> output sai dù code không lỗi.

Lỗi 3: label mapping bị ngược

Ví dụ JSON là label -> id nhưng BE đọc như id -> label.

=> ra sai từ.

Lỗi 4: output ONNX không phải tensor<int/long>

Một số model export ra probability map phức tạp.

=> lúc đó phải inspect output lại.

Lỗi 5: input name sai

Một số người hardcode "input" nhưng model thật tên là "float_input".

=> fail.

Vì vậy mình mới cho bạn endpoint model-info.