namespace SignLanguageAI.Models
{
    public class PredictResponse
    {
        public int PredictedId { get; set; }
        public string Label { get; set; } = "unknown";
        public float Confidence { get; set; } = 0f;
    }
}
