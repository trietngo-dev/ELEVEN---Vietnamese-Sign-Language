package com.example.vietnamese_sign_language_platform

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.holisticlandmarker.HolisticLandmarker
import com.google.mediapipe.tasks.vision.holisticlandmarker.HolisticLandmarkerResult
import com.google.mediapipe.framework.image.BitmapImageBuilder
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import android.util.Log

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.eleven.vsl/hand_tracker"
    private var holisticLandmarker: HolisticLandmarker? = null
    private var lastTimestampMs = 0L

    private val SELECTED_POSE_INDICES = intArrayOf(0, 11, 12, 13, 14, 15, 16, 23, 24)
    private val SELECTED_FACE_INDICES = intArrayOf(
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317,
        14, 87, 178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 46, 53, 52,
        65, 55, 70, 63, 105, 66, 107, 276, 283, 282, 295, 285, 300, 293, 334, 296,
        336
    )

    @Synchronized
    private fun initializeHolisticLandmarker(): Boolean {
        if (holisticLandmarker != null) {
            return true
        }

        try {
            // Load model file from assets
            val modelPath = copyAssetToStorage("holistic_landmarker.task")
            if (modelPath == null) {
                Log.e("MainActivity", "Failed to copy holistic_landmarker.task from assets")
                return false
            }

            val baseOptionsBuilder = BaseOptions.builder()
                .setModelAssetPath(modelPath)

            // Attempt to use GPU delegate for performance, fallback to CPU
            try {
                baseOptionsBuilder.setDelegate(com.google.mediapipe.tasks.core.Delegate.GPU)
            } catch (e: Exception) {
                Log.w("MainActivity", "GPU Delegate not supported, falling back to CPU: $e")
                baseOptionsBuilder.setDelegate(com.google.mediapipe.tasks.core.Delegate.CPU)
            }

            val options = HolisticLandmarker.HolisticLandmarkerOptions.builder()
                .setBaseOptions(baseOptionsBuilder.build())
                .setMinFaceDetectionConfidence(0.5f)
                .setMinPoseDetectionConfidence(0.5f)
                .setMinHandLandmarksConfidence(0.5f)
                .setRunningMode(RunningMode.VIDEO)
                .build()

            holisticLandmarker = HolisticLandmarker.createFromOptions(this, options)
            Log.i("MainActivity", "Successfully initialized MediaPipe Holistic Landmarker")
            return true
        } catch (e: Exception) {
            Log.e("MainActivity", "Error initializing MediaPipe Holistic Landmarker: $e")
            return false
        }
    }

    @Synchronized
    private fun closeHolisticLandmarker() {
        try {
            holisticLandmarker?.close()
        } catch (e: Exception) {
            Log.w("MainActivity", "Error closing MediaPipe Holistic Landmarker: $e")
        } finally {
            holisticLandmarker = null
        }
    }

    private fun copyAssetToStorage(assetName: String): String? {
        try {
            val file = File(filesDir, assetName)
            if (file.exists() && file.length() > 0) {
                return file.absolutePath
            }
            val inputStream: InputStream = assets.open(assetName)
            val outputStream = FileOutputStream(file)
            val buffer = ByteArray(1024)
            var read: Int
            while (inputStream.read(buffer).also { read = it } != -1) {
                outputStream.write(buffer, 0, read)
            }
            outputStream.flush()
            outputStream.close()
            inputStream.close()
            return file.absolutePath
        } catch (e: Exception) {
            Log.e("MainActivity", "Error copying asset: $e")
            return null
        }
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "initializeHolistic" -> {
                    if (initializeHolisticLandmarker()) {
                        result.success(null)
                    } else {
                        result.error("INIT_FAILED", "Holistic landmarker failed to initialize", null)
                    }
                }
                "closeHolistic" -> {
                    closeHolisticLandmarker()
                    result.success(null)
                }
                "processFrame" -> {
                    val bytes = call.argument<ByteArray>("bytes")
                    val width = call.argument<Int>("width")
                    val height = call.argument<Int>("height")

                    if (bytes == null || width == null || height == null) {
                        result.error("INVALID_ARGUMENTS", "Required arguments bytes, width, or height are missing", null)
                        return@setMethodCallHandler
                    }

                    if (holisticLandmarker == null && !initializeHolisticLandmarker()) {
                        result.error("NOT_INITIALIZED", "Holistic landmarker is not initialized", null)
                        return@setMethodCallHandler
                    }

                    // Run inference on a background worker thread
                    Thread {
                        try {
                            val bitmap = nv21ToBitmap(bytes, width, height)
                            val mpImage = BitmapImageBuilder(bitmap).build()

                            var timestampMs = System.currentTimeMillis()
                            if (timestampMs <= lastTimestampMs) {
                                timestampMs = lastTimestampMs + 1
                            }
                            lastTimestampMs = timestampMs

                            val detectionResult = holisticLandmarker?.detectForVideo(mpImage, timestampMs)
                            val flatLandmarks = parseHolisticLandmarks(detectionResult)

                            // Recycle bitmap
                            bitmap.recycle()

                            runOnUiThread {
                                result.success(flatLandmarks)
                            }
                        } catch (e: Exception) {
                            runOnUiThread {
                                result.error("INFERENCE_ERROR", "Error during holistic tracking inference: $e", null)
                            }
                        }
                    }.start()
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun nv21ToBitmap(nv21: ByteArray, width: Int, height: Int): Bitmap {
        val yuvImage = YuvImage(nv21, ImageFormat.NV21, width, height, null)
        val out = ByteArrayOutputStream()
        yuvImage.compressToJpeg(Rect(0, 0, width, height), 90, out)
        val imageBytes = out.toByteArray()
        val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)

        val matrix = android.graphics.Matrix()
        // Rotate 270 degrees for portrait orientation
        matrix.postRotate(270f)
        // Flip horizontally to simulate mirrored selfie camera view
        matrix.postScale(-1f, 1f)

        val transformed = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)

        bitmap.recycle()
        return transformed
    }

    private fun parseHolisticLandmarks(result: HolisticLandmarkerResult?): List<Double> {
        val list = ArrayList<Double>()

        // 1. Pose (9 landmarks -> 27 floats)
        val poseLandmarks = result?.poseLandmarks()
        if (poseLandmarks != null && poseLandmarks.isNotEmpty()) {
            for (idx in SELECTED_POSE_INDICES) {
                if (idx < poseLandmarks.size) {
                    val lm = poseLandmarks[idx]
                    list.add(lm.x().toDouble())
                    list.add(lm.y().toDouble())
                    list.add(lm.z().toDouble())
                } else {
                    list.add(0.0)
                    list.add(0.0)
                    list.add(0.0)
                }
            }
        } else {
            for (i in 0 until 9 * 3) {
                list.add(0.0)
            }
        }

        // 2. Face (51 landmarks -> 153 floats)
        val faceLandmarks = result?.faceLandmarks()
        if (faceLandmarks != null && faceLandmarks.isNotEmpty()) {
            for (idx in SELECTED_FACE_INDICES) {
                if (idx < faceLandmarks.size) {
                    val lm = faceLandmarks[idx]
                    list.add(lm.x().toDouble())
                    list.add(lm.y().toDouble())
                    list.add(lm.z().toDouble())
                } else {
                    list.add(0.0)
                    list.add(0.0)
                    list.add(0.0)
                }
            }
        } else {
            for (i in 0 until 51 * 3) {
                list.add(0.0)
            }
        }

        // 3. Left Hand (21 landmarks -> 63 floats)
        val leftHandLandmarks = result?.leftHandLandmarks()
        if (leftHandLandmarks != null && leftHandLandmarks.isNotEmpty()) {
            for (i in 0 until 21) {
                if (i < leftHandLandmarks.size) {
                    val lm = leftHandLandmarks[i]
                    list.add(lm.x().toDouble())
                    list.add(lm.y().toDouble())
                    list.add(lm.z().toDouble())
                } else {
                    list.add(0.0)
                    list.add(0.0)
                    list.add(0.0)
                }
            }
        } else {
            for (i in 0 until 21 * 3) {
                list.add(0.0)
            }
        }

        // 4. Right Hand (21 landmarks -> 63 floats)
        val rightHandLandmarks = result?.rightHandLandmarks()
        if (rightHandLandmarks != null && rightHandLandmarks.isNotEmpty()) {
            for (i in 0 until 21) {
                if (i < rightHandLandmarks.size) {
                    val lm = rightHandLandmarks[i]
                    list.add(lm.x().toDouble())
                    list.add(lm.y().toDouble())
                    list.add(lm.z().toDouble())
                } else {
                    list.add(0.0)
                    list.add(0.0)
                    list.add(0.0)
                }
            }
        } else {
            for (i in 0 until 21 * 3) {
                list.add(0.0)
            }
        }

        return list
    }
}
