package com.ludomaster3d.game;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.WindowManager;
import android.webkit.DownloadListener;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Unlock 90Hz / 120Hz Ultra High Refresh Rate Display Mode on Android (API 23+)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Display display = getWindowManager().getDefaultDisplay();
                Display.Mode[] modes = display.getSupportedModes();
                Display.Mode maxMode = null;
                for (Display.Mode mode : modes) {
                    if (maxMode == null || mode.getRefreshRate() > maxMode.getRefreshRate()) {
                        maxMode = mode;
                    }
                }
                if (maxMode != null && maxMode.getRefreshRate() >= 85.0f) {
                    WindowManager.LayoutParams params = getWindow().getAttributes();
                    params.preferredDisplayModeId = maxMode.getModeId();
                    getWindow().setAttributes(params);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().setDownloadListener(new DownloadListener() {
                    @Override
                    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                        try {
                            Intent i = new Intent(Intent.ACTION_VIEW);
                            i.setData(Uri.parse(url));
                            startActivity(i);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
