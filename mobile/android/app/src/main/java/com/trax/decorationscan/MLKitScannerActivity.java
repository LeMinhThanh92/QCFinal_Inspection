package com.trax.decorationscan;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.Image;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MLKitScannerActivity extends AppCompatActivity {

    private static final String TAG = "MLKitScannerActivity";
    private static final int PERMISSION_REQUEST_CAMERA = 1001;

    private PreviewView previewView;
    private ExecutorService cameraExecutor;
    private boolean isScanning = true;

    // Debounce to prevent partial scans
    private String lastScannedBarcode = "";
    private int matchCount = 0;
    private static final int REQUIRED_MATCH_COUNT = 3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        FrameLayout frameLayout = new FrameLayout(this);
        frameLayout.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        previewView = new PreviewView(this);
        previewView.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        frameLayout.addView(previewView);

        Button cancelButton = new Button(this);
        cancelButton.setText("Hủy / Cancel");
        cancelButton.setBackgroundColor(Color.parseColor("#80000000"));
        cancelButton.setTextColor(Color.WHITE);
        FrameLayout.LayoutParams btnParams = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        btnParams.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        btnParams.bottomMargin = 100;
        cancelButton.setLayoutParams(btnParams);
        cancelButton.setOnClickListener(v -> finishActivityWithResult(null, null));
        frameLayout.addView(cancelButton);

        setContentView(frameLayout);

        cameraExecutor = Executors.newSingleThreadExecutor();

        if (allPermissionsGranted()) {
            startCamera();
        } else {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, PERMISSION_REQUEST_CAMERA);
        }
    }

    private boolean allPermissionsGranted() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(this);

        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();

                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());

                // Set options for specific barcode types per requirement
                BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
                        .setBarcodeFormats(
                                Barcode.FORMAT_CODE_128,
                                Barcode.FORMAT_CODE_39,
                                Barcode.FORMAT_QR_CODE,
                                Barcode.FORMAT_DATA_MATRIX,
                                Barcode.FORMAT_EAN_13,
                                Barcode.FORMAT_EAN_8,
                                Barcode.FORMAT_UPC_A,
                                Barcode.FORMAT_UPC_E,
                                Barcode.FORMAT_ITF,
                                Barcode.FORMAT_CODABAR
                        )
                        .build();

                BarcodeScanner scanner = BarcodeScanning.getClient(options);

                ImageAnalysis imageAnalysis = new ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build();

                imageAnalysis.setAnalyzer(cameraExecutor, new ImageAnalysis.Analyzer() {
                    @SuppressLint("UnsafeOptInUsageError")
                    @Override
                    public void analyze(@NonNull ImageProxy imageProxy) {
                        if (!isScanning) {
                            imageProxy.close();
                            return;
                        }

                        Image mediaImage = imageProxy.getImage();
                        if (mediaImage != null) {
                            InputImage image = InputImage.fromMediaImage(mediaImage, imageProxy.getImageInfo().getRotationDegrees());
                            scanner.process(image)
                                    .addOnSuccessListener(barcodes -> {
                                        if (barcodes != null && !barcodes.isEmpty()) {
                                            boolean found = false;
                                            for (Barcode barcode : barcodes) {
                                                String rawValue = barcode.getDisplayValue();
                                                if (rawValue != null) {
                                                    if (rawValue.equals(lastScannedBarcode)) {
                                                        matchCount++;
                                                    } else {
                                                        lastScannedBarcode = rawValue;
                                                        matchCount = 1;
                                                    }

                                                    if (matchCount >= REQUIRED_MATCH_COUNT) {
                                                        Log.d(TAG, "Barcode consistently found: " + rawValue);
                                                        isScanning = false;
                                                        finishActivityWithResult(rawValue, getFormatName(barcode.getFormat()));
                                                        found = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (!found) {
                                                imageProxy.close();
                                            }
                                        } else {
                                            // Reset if no barcode seen in a frame to require continuous reading
                                            matchCount = 0;
                                            imageProxy.close();
                                        }
                                    })
                                    .addOnFailureListener(e -> {
                                        Log.e(TAG, "Barcode analysis failed", e);
                                        imageProxy.close();
                                    });
                                    // Removed addOnCompleteListener to manage imageProxy closing accurately
                        } else {
                            imageProxy.close();
                        }
                    }
                });

                CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;
                cameraProvider.unbindAll();
                cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageAnalysis);

            } catch (ExecutionException | InterruptedException e) {
                Log.e(TAG, "Use case binding failed", e);
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void finishActivityWithResult(String barcode, String format) {
        if (barcode != null) {
            Intent resultIntent = new Intent();
            resultIntent.putExtra("barcode", barcode);
            resultIntent.putExtra("format", format != null ? format : "UNKNOWN");
            setResult(RESULT_OK, resultIntent);
        } else {
            setResult(RESULT_CANCELED);
        }
        finish();
    }

    private String getFormatName(int format) {
        switch (format) {
            case Barcode.FORMAT_CODE_128: return "CODE_128";
            case Barcode.FORMAT_CODE_39: return "CODE_39";
            case Barcode.FORMAT_QR_CODE: return "QR_CODE";
            case Barcode.FORMAT_DATA_MATRIX: return "DATA_MATRIX";
            case Barcode.FORMAT_EAN_13: return "EAN_13";
            case Barcode.FORMAT_EAN_8: return "EAN_8";
            case Barcode.FORMAT_UPC_A: return "UPC_A";
            case Barcode.FORMAT_UPC_E: return "UPC_E";
            case Barcode.FORMAT_ITF: return "ITF";
            case Barcode.FORMAT_CODABAR: return "CODABAR";
            default: return "UNKNOWN";
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CAMERA) {
            if (allPermissionsGranted()) {
                startCamera();
            } else {
                Toast.makeText(this, "Không có quyền truy cập Camera.", Toast.LENGTH_SHORT).show();
                finishActivityWithResult(null, null);
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (cameraExecutor != null) {
            cameraExecutor.shutdown();
        }
    }
}
