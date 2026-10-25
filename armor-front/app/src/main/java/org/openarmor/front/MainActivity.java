package org.openarmor.front;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;
import java.util.Locale;

/** HTML and licensed GLB assets served under a virtual HTTPS origin. */
public class MainActivity extends Activity {
  private static final int PICK_GLB = 742;
  private static final String HOST = "appassets.androidplatform.net";
  private WebView browser;
  private ValueCallback<Uri[]> pendingFileSelection;

  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().getDecorView().setSystemUiVisibility(
        View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    browser = new WebView(this);
    browser.setKeepScreenOn(true);
    browser.setLayerType(View.LAYER_TYPE_HARDWARE, null);
    browser.getSettings().setJavaScriptEnabled(true);
    browser.getSettings().setDomStorageEnabled(true);
    browser.getSettings().setMediaPlaybackRequiresUserGesture(false);
    browser.getSettings().setAllowFileAccess(false);
    browser.getSettings().setAllowContentAccess(true);
    browser.getSettings().setAllowUniversalAccessFromFileURLs(false);
    browser.setWebViewClient(new WebViewClient() {
      @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        if (!"https".equalsIgnoreCase(uri.getScheme()) || !HOST.equalsIgnoreCase(uri.getHost()))
          return super.shouldInterceptRequest(view, request);
        String path = uri.getEncodedPath();
        if (path == null || !path.startsWith("/assets/")) return notFound();
        path = Uri.decode(path.substring("/assets/".length()));
        if (path.startsWith("/") || path.contains("\\") || path.contains("..")) return notFound();
        try {
          InputStream stream = getAssets().open(path);
          String mime = mimeFor(path);
          return new WebResourceResponse(mime,
              mime.startsWith("text/") || mime.contains("javascript") || mime.contains("json") ? "UTF-8" : null, stream);
        } catch (IOException ex) { return notFound(); }
      }
    });
    browser.setWebChromeClient(new WebChromeClient() {
      @Override public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
        if (pendingFileSelection != null) pendingFileSelection.onReceiveValue(null);
        pendingFileSelection = callback;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"model/gltf-binary", "application/octet-stream", "application/gltf-buffer"});
        try { startActivityForResult(intent, PICK_GLB); }
        catch (Exception ex) { pendingFileSelection.onReceiveValue(null); pendingFileSelection = null; }
        return true;
      }
    });
    setContentView(browser);
    browser.loadUrl("https://" + HOST + "/assets/index.html");
  }
  private static String mimeFor(String name) {
    String n = name.toLowerCase(Locale.US);
    if (n.endsWith(".html")) return "text/html";
    if (n.endsWith(".js") || n.endsWith(".mjs")) return "application/javascript";
    if (n.endsWith(".css")) return "text/css";
    if (n.endsWith(".json")) return "application/json";
    if (n.endsWith(".glb")) return "model/gltf-binary";
    if (n.endsWith(".png")) return "image/png";
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
    if (n.endsWith(".webp")) return "image/webp";
    if (n.endsWith(".mp3")) return "audio/mpeg";
    if (n.endsWith(".ogg")) return "audio/ogg";
    String mime = URLConnection.guessContentTypeFromName(name);
    return mime == null ? "application/octet-stream" : mime;
  }
  private static WebResourceResponse notFound() {
    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null,
        new java.io.ByteArrayInputStream(new byte[0]));
  }
  @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode != PICK_GLB || pendingFileSelection == null) return;
    Uri[] selected = resultCode == RESULT_OK && data != null && data.getData() != null
        ? new Uri[]{data.getData()} : null;
    pendingFileSelection.onReceiveValue(selected);
    pendingFileSelection = null;
  }
  @Override public void onBackPressed() {
    if (browser != null && browser.canGoBack()) browser.goBack(); else super.onBackPressed();
  }
  @Override protected void onDestroy() {
    if (pendingFileSelection != null) { pendingFileSelection.onReceiveValue(null); pendingFileSelection = null; }
    if (browser != null) browser.destroy();
    super.onDestroy();
  }
}