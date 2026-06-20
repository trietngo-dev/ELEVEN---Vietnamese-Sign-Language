import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/gesture/predict_gesture_usecase.dart';
import '../../domain/usecases/gesture/translate_sentence_usecase.dart';

// --- Events ---
abstract class GestureEvent {}

class GestureSessionReset extends GestureEvent {}

class GestureFrameCaptured extends GestureEvent {
  final List<double> frameFeatures; // 306 features per frame
  GestureFrameCaptured(this.frameFeatures);
}

class GesturePolishRequested extends GestureEvent {}

// --- States ---
abstract class GestureState {}

class GestureInitial extends GestureState {}

class GestureBufferUpdating extends GestureState {
  final int capturedFrames;
  final List<String> recognizedWords;
  GestureBufferUpdating(this.capturedFrames, this.recognizedWords);
}

class GesturePredictionSuccess extends GestureState {
  final String predictedWord;
  final double confidence;
  final List<String> recognizedWords;
  final int capturedFrames;

  GesturePredictionSuccess({
    required this.predictedWord,
    required this.confidence,
    required this.recognizedWords,
    required this.capturedFrames,
  });
}

class GestureTranslationSuccess extends GestureState {
  final String finalSentence;
  final List<String> recognizedWords;
  GestureTranslationSuccess(this.finalSentence, this.recognizedWords);
}

class GestureFailure extends GestureState {
  final String error;
  GestureFailure(this.error);
}

// --- Bloc ---
class GestureBloc extends Bloc<GestureEvent, GestureState> {
  final PredictGestureUseCase predictGestureUseCase;
  final TranslateSentenceUseCase translateSentenceUseCase;
  
  final List<List<double>> _frameBuffer = [];
  final List<String> _recognizedWords = [];
  bool _isPredicting = false;

  static const int targetFrameCount = 50;
  static const double confidenceThreshold = 0.95; // Tăng ngưỡng tự tin lên 95% đồng bộ với Web

  GestureBloc({
    required this.predictGestureUseCase,
    required this.translateSentenceUseCase,
  }) : super(GestureInitial()) {
    on<GestureSessionReset>((event, emit) {
      _frameBuffer.clear();
      _recognizedWords.clear();
      _isPredicting = false;
      emit(GestureInitial());
    });

    on<GestureFrameCaptured>((event, emit) async {
      // If predicting, drop frames or queue them.
      if (event.frameFeatures.length != 306) {
        return;
      }

      _frameBuffer.add(event.frameFeatures);
      
      // If idle frames (no user pose) are captured, we should flush the buffer
      final isIdleFrame = event.frameFeatures.take(27).every((v) => v == 0.0); // Check pose coordinates on Mobile
      if (isIdleFrame && _frameBuffer.length > 20) {
        // Flush buffer if idle too long
        _frameBuffer.clear();
        emit(GestureBufferUpdating(0, List.from(_recognizedWords)));
        return;
      }

      if (_frameBuffer.length >= targetFrameCount) {
        if (_isPredicting) {
          // Slide window even if we skip prediction to prevent huge buffer buildup
          _frameBuffer.removeAt(0);
          return;
        }

        _isPredicting = true;
        
        // Prepare sliding window payload
        final payload = _frameBuffer.take(targetFrameCount).expand((frame) => frame).toList();
        
        // Slide window by 35 frames (keep last 15 frames for overlap)
        _frameBuffer.removeRange(0, targetFrameCount - 15);
        
        emit(GestureBufferUpdating(_frameBuffer.length, List.from(_recognizedWords)));

        try {
          final result = await predictGestureUseCase(payload);
          final word = (result['word'] ?? result['label'] ?? '') as String;
          final confidence = (result['confidence'] ?? 0.0) as double;

          _isPredicting = false;

          if (word.isNotEmpty && confidence >= confidenceThreshold && !word.toLowerCase().contains('ngoiim')) {
            // Avoid duplicate words back-to-back
            if (_recognizedWords.isEmpty || _recognizedWords.last != word) {
              _recognizedWords.add(word);
            }
          }

          emit(GesturePredictionSuccess(
            predictedWord: word,
            confidence: confidence,
            recognizedWords: List.from(_recognizedWords),
            capturedFrames: _frameBuffer.length,
          ));
        } catch (e) {
          _isPredicting = false;
          emit(GestureFailure(e.toString().replaceAll('Exception: ', '')));
        }
      } else {
        emit(GestureBufferUpdating(_frameBuffer.length, List.from(_recognizedWords)));
      }
    });

    on<GesturePolishRequested>((event, emit) async {
      if (_recognizedWords.isEmpty) {
        emit(GestureTranslationSuccess('', const []));
        return;
      }

      emit(GestureBufferUpdating(0, List.from(_recognizedWords)));

      try {
        final sentence = await translateSentenceUseCase(_recognizedWords);
        emit(GestureTranslationSuccess(sentence, List.from(_recognizedWords)));
      } catch (e) {
        emit(GestureFailure(e.toString().replaceAll('Exception: ', '')));
      }
    });
  }
}
