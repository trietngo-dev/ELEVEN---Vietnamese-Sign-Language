using SignLanguageAI.Models;

namespace SignLanguageAI.Services
{
    /// <summary>
    /// Service to manage 50-frame circular buffer for real-time gesture recognition
    /// Maintains a sliding window of 50 frames and provides features on demand
    /// </summary>
    public class FrameBufferService
    {
        private readonly Queue<FrameKeypoints> _buffer;
        private readonly FeatureExtractionService _featureService;
        private readonly ILogger<FrameBufferService> _logger;
        private readonly int _maxFrames = 50;
        private readonly object _lockObject = new object();

        public FrameBufferService(FeatureExtractionService featureService, ILogger<FrameBufferService> logger)
        {
            _featureService = featureService;
            _logger = logger;
            _buffer = new Queue<FrameKeypoints>(_maxFrames);
        }

        /// <summary>
        /// Add a new frame to the buffer
        /// If buffer is full, removes oldest frame (FIFO)
        /// </summary>
        public void AddFrame(FrameKeypoints frame)
        {
            if (frame == null)
                throw new ArgumentNullException(nameof(frame));

            if (!frame.IsValid())
                throw new ArgumentException("Frame không hợp lệ");

            lock (_lockObject)
            {
                if (_buffer.Count >= _maxFrames)
                {
                    _buffer.Dequeue(); // Remove oldest
                }
                _buffer.Enqueue(frame);

                if (_buffer.Count == _maxFrames)
                {
                    _logger.LogDebug($"Buffer full: {_buffer.Count} frames ready for prediction");
                }
            }
        }

        /// <summary>
        /// Check if buffer has enough frames for prediction (50 frames)
        /// </summary>
        public bool IsReady()
        {
            lock (_lockObject)
            {
                return _buffer.Count >= _maxFrames;
            }
        }

        /// <summary>
        /// Get current frame count in buffer
        /// </summary>
        public int GetFrameCount()
        {
            lock (_lockObject)
            {
                return _buffer.Count;
            }
        }

        /// <summary>
        /// Get all buffered frames as list (up to 50)
        /// </summary>
        public List<FrameKeypoints> GetBufferedFrames()
        {
            lock (_lockObject)
            {
                return new List<FrameKeypoints>(_buffer);
            }
        }

        /// <summary>
        /// Get flattened 15,300 features from current buffer
        /// Only valid when IsReady() returns true
        /// </summary>
        public List<float> GetFlattenedFeatures()
        {
            lock (_lockObject)
            {
                if (_buffer.Count == 0)
                    throw new InvalidOperationException("Buffer is empty");

                var frames = new List<FrameKeypoints>(_buffer);
                return _featureService.ExtractFeatures(new KeypointsInput { Frames = frames });
            }
        }

        /// <summary>
        /// Clear all frames from buffer (reset for new gesture)
        /// </summary>
        public void Clear()
        {
            lock (_lockObject)
            {
                _buffer.Clear();
                _logger.LogInformation("Frame buffer cleared");
            }
        }

        /// <summary>
        /// Get buffer statistics
        /// </summary>
        public (int currentCount, int maxCapacity, bool isReady) GetStats()
        {
            lock (_lockObject)
            {
                return (_buffer.Count, _maxFrames, _buffer.Count >= _maxFrames);
            }
        }
    }
}
