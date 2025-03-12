package com.hbolte.capacitor.tus.client;

import android.util.Log;

public class CapacitorTusClient {

    public String echo(String value) {
        Log.i("Echo", value);
        return value;
    }
}
