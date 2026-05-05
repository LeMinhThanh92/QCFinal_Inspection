package com.trax.decorationscan;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MLKitScannerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
