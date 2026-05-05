package com.trax.decorationscan;

import android.content.Intent;
import android.util.Log;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MLKitScanner")
public class MLKitScannerPlugin extends Plugin {

    @PluginMethod
    public void scan(PluginCall call) {
        Intent intent = new Intent(getContext(), MLKitScannerActivity.class);
        startActivityForResult(call, intent, "scanResult");
    }

    @ActivityCallback
    private void scanResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        JSObject ret = new JSObject();
        if (result.getResultCode() == android.app.Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data != null) {
                String barcode = data.getStringExtra("barcode");
                String format = data.getStringExtra("format");
                ret.put("hasContent", true);
                ret.put("content", barcode);
                if (format != null) {
                    ret.put("format", format);
                }
                call.resolve(ret);
                return;
            }
        }
        
        // Canceled or no result
        ret.put("hasContent", false);
        call.resolve(ret);
    }
}
