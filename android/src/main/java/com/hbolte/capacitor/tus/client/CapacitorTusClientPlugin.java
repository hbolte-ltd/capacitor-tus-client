package com.hbolte.capacitor.tus.client;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.tus.java.client.ProtocolException;

/**
 * CapacitorTusClientPlugin is a Capacitor plugin that facilitates uploading files using the Tus protocol.
 * It allows users to pick a file, configure upload options (endpoint, headers, metadata, chunk size),
 * initiate the upload, pause, resume, and abort the upload process.
 * <p>
 * The plugin uses a thread pool to manage uploads concurrently and supports the selection of files
 * with specified MIME types. It also provides events to track the progress and status of uploads.
 */
@CapacitorPlugin(name = "CapacitorTusClient")
public class CapacitorTusClientPlugin extends Plugin {
    private final Map<String, CapacitorTusClientRunnable> executorsMap = new HashMap<>();
    private final ExecutorService pool = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());

    @PluginMethod
    public void upload(PluginCall call) {
        JSObject options = call.getObject("options");
        if (options == null) {
            call.reject("Missing options for the upload.");
            return;
        }

        String fileUri = options.getString("uri");

        if (fileUri == null || fileUri.isEmpty()) {
            call.reject("The 'uri' provided is null or empty.");
            return;
        }

        Uri uri = Uri.parse(fileUri);
        if (uri == null) {
            call.reject("The 'uri' could not be parsed.");
            return;
        }

        String endpoint = options.getString("endpoint");
        JSObject headersJson = options.getJSObject("headers");
        JSObject metadataJson = options.getJSObject("metadata");
        Integer customChunkSize = options.getInteger("chunkSize", null);

        if (endpoint == null) {
            call.reject("Missing endpoint in options.");
            return;
        }

        CapacitorTusClientConfig config = CapacitorTusClientConfig.getInstance();

        if (customChunkSize != null && customChunkSize > 0) {
            config.setChunkSize(customChunkSize);
        }

        Map<String, String> headers = new HashMap<>();
        Map<String, String> metadata = new HashMap<>();

        if (headersJson != null) {
            Iterator<String> keys = headersJson.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                headers.put(key, headersJson.getString(key));
            }
        }

        if (metadataJson != null) {
            Iterator<String> keys = metadataJson.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                metadata.put(key, metadataJson.getString(key));
            }
        }

        try {
            InputStream inputStream = getContext().getContentResolver().openInputStream(uri);
            if (inputStream == null) {
                call.reject("Unable to open file stream for the Uri.");
                return;
            }

            String uploadId = UUID.randomUUID().toString();
            CapacitorTusClientRunnable executor = new CapacitorTusClientRunnable(
                    this,
                    getContext().getSharedPreferences("tus", 0),
                    inputStream,
                    getFileName(getContext(), uri),
                    uploadId,
                    endpoint,
                    metadata,
                    headers
            );
            executorsMap.put(uploadId, executor);

            // Start the upload
            if (!executor.isRunning()) {
                pool.submit(executor);
            }

            JSObject result = new JSObject();
            result.put("uploadId", uploadId);
            call.resolve(result);

        } catch (IOException e) {
            call.reject("Error creating upload: " + e.getMessage());
        }
    }

    @PluginMethod
    public void pause(PluginCall call) {
        String uploadId = call.getString("uploadId");
        if (uploadId == null || !executorsMap.containsKey(uploadId)) {
            call.reject("Invalid or missing uploadId");
            return;
        }

        CapacitorTusClientRunnable executor = executorsMap.get(uploadId);
        executor.pause();

        JSObject result = new JSObject();
        result.put("success", true);
        result.put("message", "Upload paused successfully");
        call.resolve(result);
    }

    @PluginMethod
    public void resume(PluginCall call) {
        String uploadId = call.getString("uploadId");
        if (uploadId == null || !executorsMap.containsKey(uploadId)) {
            call.reject("Invalid or missing uploadId");
            return;
        }

        CapacitorTusClientRunnable executor = executorsMap.get(uploadId);
        executor.resume();

        if (!executor.isRunning()) {
            pool.submit(executor);
        }

        JSObject result = new JSObject();
        result.put("success", true);
        result.put("message", "Upload resumed successfully");
        call.resolve(result);
    }

    @PluginMethod
    public void abort(PluginCall call) {
        String uploadId = call.getString("uploadId");
        if (uploadId == null || !executorsMap.containsKey(uploadId)) {
            call.reject("Invalid or missing uploadId");
            return;
        }

        try {
            CapacitorTusClientRunnable executor = executorsMap.get(uploadId);
            executor.finish();
            call.resolve();
        } catch (IOException | ProtocolException e) {
            call.reject("Error aborting upload: " + e.getMessage());
        }
    }

    private String getFileName(Context context, Uri uri) {
        Cursor cursor = context.getContentResolver().query(uri, null, null, null, null);
        if (cursor != null) {
            try {
                int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (nameIndex != -1 && cursor.moveToFirst()) {
                    return cursor.getString(nameIndex);
                }
            } finally {
                cursor.close();
            }
        }
        return "unknown_file";
    }

    public void triggerListener(String event, JSObject data) {
        notifyListeners(event, data);
    }
}