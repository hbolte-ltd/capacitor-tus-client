package com.hbolte.capacitor.tus.client;

import android.content.SharedPreferences;
import android.util.Log;
import com.getcapacitor.JSObject;
import io.tus.android.client.TusPreferencesURLStore;
import io.tus.java.client.ProtocolException;
import io.tus.java.client.TusClient;
import io.tus.java.client.TusExecutor;
import io.tus.java.client.TusUpload;
import io.tus.java.client.TusUploader;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

/**
 * CapacitorTusClientRunnable is a class that implements the Runnable interface and extends TusExecutor.
 * It is responsible for handling the TUS (resumable upload) process within the Capacitor environment.
 * This class manages the upload of a file in chunks, handling pausing, resuming, and finishing the upload.
 * It also communicates upload progress and results back to the Capacitor plugin.
 */
public class CapacitorTusClientRunnable extends TusExecutor implements Runnable {

    private final TusUpload upload;
    private TusUploader uploader;
    private final TusClient client;
    private final String uploadId;
    private boolean shouldFinish;
    private boolean isRunning;
    private boolean isPaused;
    private final CapacitorTusClientPlugin plugin;

    public CapacitorTusClientRunnable(
        CapacitorTusClientPlugin plugin,
        SharedPreferences pref,
        InputStream inputStream,
        String fileName,
        String uploadId,
        String endpoint,
        Map<String, String> metadata,
        Map<String, String> headers
    ) throws MalformedURLException {
        this.plugin = plugin;
        this.uploadId = uploadId;

        client = new TusClient();
        client.setUploadCreationURL(new URL(endpoint));
        client.enableResuming(new TusPreferencesURLStore(pref));
        client.setHeaders(headers);

        upload = new TusUpload();
        upload.setInputStream(inputStream);

        try {
            int size = inputStream.available();
            upload.setSize(size);
        } catch (IOException e) {
            Log.w("CapacitorTusClient", "Failed to determine InputStream size, proceeding without size.");
        }

        upload.setFingerprint(String.format("%s-%s", fileName, uploadId));
        metadata.put("filename", fileName);
        upload.setMetadata(metadata);

        shouldFinish = false;
        isRunning = false;
        isPaused = false;
    }

    @Override
    protected void makeAttempt() throws ProtocolException, IOException {
        uploader = client.resumeOrCreateUpload(upload);
        int chunkSize = CapacitorTusClientConfig.getInstance().getChunkSize();
        uploader.setChunkSize(chunkSize);

        long totalBytes = upload.getSize();
        do {
            while (isPaused && !shouldFinish) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }

            long bytesUploaded = uploader.getOffset();
            double progress = ((double) bytesUploaded / totalBytes) * 100;

            JSObject progressData = new JSObject();
            progressData.put("uploadId", uploadId);
            progressData.put("progress", progress);
            progressData.put("bytesUploaded", bytesUploaded);
            progressData.put("totalBytes", totalBytes);
            progressData.put("context", upload.getMetadata());

            plugin.triggerListener("onProgress", progressData);
        } while (uploader.uploadChunk() > -1 && !shouldFinish);

        uploader.finish();
    }

    @Override
    public void run() {
        isRunning = true;

        // Notify the listener that the upload has started
        JSObject startData = new JSObject();
        startData.put("uploadId", uploadId);
        startData.put("context", upload.getMetadata());
        plugin.triggerListener("onStart", startData);

        try {
            makeAttempts();

            String uploadUrl = uploader.getUploadURL().toString();

            JSObject successData = new JSObject();
            successData.put("uploadId", uploadId);
            successData.put("uploadUrl", uploadUrl);
            successData.put("context", upload.getMetadata());

            plugin.triggerListener("onSuccess", successData);
        } catch (ProtocolException | IOException e) {
            JSObject errorData = new JSObject();
            errorData.put("uploadId", uploadId);
            errorData.put("error", e.getMessage());
            errorData.put("context", upload.getMetadata());

            plugin.triggerListener("onError", errorData);
        }
        isRunning = false;
    }

    public void pause() {
        isPaused = true;
        Log.d("CapacitorTusClient", "Upload paused for uploadId: " + uploadId);
    }

    public void resume() {
        isPaused = false;
        Log.d("CapacitorTusClient", "Upload resumed for uploadId: " + uploadId);
    }

    public void finish() throws ProtocolException, IOException {
        if (isRunning) {
            shouldFinish = true;
        } else if (uploader != null) {
            uploader.finish();
        }
    }

    public boolean isRunning() {
        return isRunning && !isPaused;
    }
}
