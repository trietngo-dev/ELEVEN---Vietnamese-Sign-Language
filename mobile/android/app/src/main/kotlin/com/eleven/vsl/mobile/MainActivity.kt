package com.eleven.vsl.mobile

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.os.Bundle
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.framework.image.BitmapImageBuilder
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import android.util.Log

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.eleven.vsl/hand_tracker"
    private var handLandmarker: HandLandmarker? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initializeHandLandmarker()
    }

    private fun initializeHandLandmarker() {
        try {
            // Load model file from assets
            val modelPath = copyAssetToStorage("hand_landmarker.task")
            if (modelPath == null) {
                Log.e("MainActivity", "Failed to copy hand_landmarker.task from assets")
                return
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

            val options = HandLandmarker.HandLandmarkerOptions.builder()
                .setBaseOptions(baseOptionsBuilder.build())
                .setMinHandDetectionConfidence(0.5f)
                .setMinTrackingConfidence(0.5f)
                .setMinHandPresenceConfidence(0.5f)
                .setNumHands(2)
                .setRunningMode(RunningMode.IMAGE)
                .build()

            handLandmarker = HandLandmarker.createFromOptions(this, options)
            Log.i("MainActivity", "Successfully initialized MediaPipe Hand Landmarker")
        } catch (e: Exception) {
            Log.e("MainActivity", "Error initializing MediaPipe Hand Landmarker: $e")
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
            if (call.method == "processFrame") {
                val bytes = call.argument<ByteArray>("bytes")
                val width = call.argument<Int>("width")
                val height = call.argument<Int>("height")

                if (bytes == null || width == null || height == null) {
                    result.error("INVALID_ARGUMENTS", "Required arguments bytes, width, or height are missing", null)
                    return@setMethodCallHandler
                }

                if (handLandmarker == null) {
                    result.error("NOT_INITIALIZED", "Hand landmarker is not initialized", null)
                    return@setMethodCallHandler
                }

                // Run inference on a background worker thread
                Thread {
                    try {
                        val bitmap = nv21ToBitmap(bytes, width, height)
                        val mpImage = BitmapImageBuilder(bitmap).build()
                        val detectionResult = handLandmarker?.detect(mpImage)
                        val flatLandmarks = parseHandLandmarks(detectionResult)
                        
                        runOnUiThread {
                            result.success(flatLandmarks)
                        }
                    } catch (e: Exception) {
                        runOnUiThread {
                            result.error("INFERENCE_ERROR", "Error during hand tracking inference: $e", null)
                        }
                    }
                }.start()
            } else {
                result.notImplemented()
            }
        }
    }

    private fun nv21ToBitmap(nv21: ByteArray, width: Int, height: Int): Bitmap {
        val yuvImage = YuvImage(nv21, ImageFormat.NV21, width, height, null)
        val out = ByteArrayOutputStream()
        yuvImage.compressToJpeg(Rect(0, 0, width, height), 90, out)
        val imageBytes = out.toByteArray()
        return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
    }

    private fun parseHandLandmarks(result: HandLandmarkerResult?): List<Double> {
        val list = ArrayList<Double>()
        // Initialize with 126 zeroes (21 landmarks * 3 coordinates * 2 hands)
        for (i in 0 until 126) {
            list.add(0.0)
        }

        if (result == null) return list

        val landmarks = result.landmarks()
        val handednesses = result.handednesses()

        for (handIdx in 0 until landmarks.size) {
            if (handIdx >= handednesses.size) break
            val handLandmarks = landmarks[handIdx]
            val handednessCategory = handednesses[handIdx]
            if (handednessCategory.isEmpty()) continue
            val label = handednessCategory[0].categoryName() // "Left" or "Right"
            
            // Hand coordinates are in normalized 0.0 - 1.0 landscape image coordinates.
            // Left Hand maps to index 0 - 62, Right Hand maps to index 63 - 125.
            val offset = if (label == "Left") 0 else 63

            for (lmIdx in 0 until 21) {
                if (lmIdx >= handLandmarks.size) break
                val lm = handLandmarks[lmIdx]
                list[offset + lmIdx * 3] = lm.x().toDouble()
                list[offset + lmIdx * 3 + 1] = lm.y().toDouble()
                list[offset + lmIdx * 3 + 2] = lm.z().toDouble()
            }
        }

        return list
    }
}
