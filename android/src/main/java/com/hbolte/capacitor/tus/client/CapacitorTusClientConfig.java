package com.hbolte.capacitor.tus.client;

/**
 * CapacitorTusClientConfig is a singleton class that holds the configuration for the Capacitor Tus client.
 * It allows you to customize settings such as the chunk size for file uploads.
 */
public class CapacitorTusClientConfig {

    private static CapacitorTusClientConfig instance;

    private int chunkSize = 6 * 1024 * 1024;

    private CapacitorTusClientConfig() {}

    public static CapacitorTusClientConfig getInstance() {
        if (instance == null) {
            instance = new CapacitorTusClientConfig();
        }
        return instance;
    }

    public int getChunkSize() {
        return chunkSize;
    }

    public void setChunkSize(int chunkSize) {
        this.chunkSize = chunkSize;
    }
}
