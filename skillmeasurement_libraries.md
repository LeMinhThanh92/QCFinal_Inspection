# DecorationScanOutput — Thư Viện & Kiến Trúc Kỹ Thuật

> **Cập nhật**: 2026-04-18 · **Version**: 1.0.2  
> **Dự án template** cho các ứng dụng scan barcode công nghiệp dùng React + Capacitor + Spring Boot

---

## 1. Frontend (React 19 + TypeScript + Vite 5)

### 1.1 dependencies

```json
"@capacitor-community/barcode-scanner": "^4.0.1",
"@capacitor/core": "^8.3.0",
"@emotion/react": "^11.14.0",
"@emotion/styled": "^11.14.0",
"@ericblade/quagga2": "^1.12.1",
"@fontsource/inter": "^5.1.1",
"@fontsource/roboto": "^5.0.13",
"@hello-pangea/dnd": "^18.0.1",
"@mui/icons-material": "^6.4.0",
"@mui/material": "^6.4.0",
"@mui/system": "^6.4.0",
"@mui/x-charts": "^8.20.0",
"@mui/x-data-grid": "^7.25.0",
"@mui/x-date-pickers": "^7.25.0",
"@preact/signals-core": "^1.6.0",
"@preact/signals-react": "^2.0.1",
"@tanstack/react-query": "^5.37.1",
"@types/dompurify": "^3.2.0",
"apexcharts": "^5.3.6",
"axios": "^1.13.6",
"date-fns": "^3.6.0",
"dayjs": "^1.11.11",
"debounce": "^2.1.0",
"dompurify": "^3.3.2",
"exceljs": "^4.4.0",
"file-saver": "^2.0.5",
"framer-motion": "^12.4.0",
"html5-qrcode": "^2.3.8",           ← ★ Camera scanner (Web/HTTP)
"jspdf": "^4.2.0",
"jspdf-autotable": "^5.0.7",
"moment": "^2.30.1",
"quill": "^2.0.3",
"react": "^19.0.0",
"react-apexcharts": "^1.7.0",
"react-barcode": "^1.5.3",
"react-beautiful-dnd": "^13.1.1",
"react-big-calendar": "^1.19.4",
"react-dom": "^19.0.0",
"react-draggable": "^4.5.0",
"react-quill": "^2.0.0",
"react-router-dom": "^7.2.0",
"react-to-print": "^2.15.1",
"react-zxing": "^2.1.0",
"sheetjs-style": "^0.15.8",
"vercel": "^34.2.6",
"xlsx": "^0.18.5",
"zustand": "^5.0.3"
```

### 1.2 devDependencies

```json
"@faker-js/faker": "^8.4.1",
"@tanstack/eslint-plugin-query": "^5.35.6",
"@types/file-saver": "^2.0.7",
"@types/node": "^20.12.12",
"@types/react": "^19.0.0",
"@types/react-dom": "^19.0.0",
"@typescript-eslint/eslint-plugin": "^7.2.0",
"@typescript-eslint/parser": "^7.2.0",
"@vitejs/plugin-legacy": "^5.4.3",
"@vitejs/plugin-react-swc": "^3.7.2",
"autoprefixer": "^10.4.20",
"eslint": "^8.57.0",
"eslint-plugin-react-hooks": "^4.6.0",
"eslint-plugin-react-refresh": "^0.4.6",
"postcss": "^8.5.0",
"quagga": "^0.12.1",
"tailwindcss": "^3.4.17",
"terser": "^5.46.1",
"typescript": "^5.7.0",
"vite": "^5.4.14",
"vite-plugin-svgr": "^4.2.0"
```

### 1.3 Vite Config (Quan trọng)

```typescript
// vite.config.ts
base: './',                        // Hỗ trợ Capacitor + static deploy
plugins: [
    react(),                       // @vitejs/plugin-react-swc
    svgr(),                        // SVG as React components
    legacy({                       // Polyfill cho Chrome cũ (tablet cũ)
        targets: ['defaults', 'not IE 11', 'chrome >= 60', 'android >= 6'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
],
resolve: {
    alias: {
        '@': './src',
        '@assets': './src/assets',
        '@components': './src/components',
    }
},
server: { port: 7779, host: true }
```

---

## 2. Backend (Java 17 + Spring Boot 3.2.5)

### 2.1 pom.xml

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
</parent>

<properties>
    <java.version>17</java.version>
    <jjwt.version>0.12.5</jjwt.version>
</properties>
```

### 2.2 dependencies

```
spring-boot-starter-web                        ← REST API
spring-boot-starter-security                   ← JWT + CORS
spring-boot-starter-data-jdbc                  ← SQL/JdbcTemplate
mssql-jdbc                           (runtime) ← SQL Server driver
io.jsonwebtoken:jjwt-api             0.12.5    ← JWT creation/validation
io.jsonwebtoken:jjwt-impl            0.12.5    (runtime)
io.jsonwebtoken:jjwt-jackson         0.12.5    (runtime)
lombok                               (optional)← Reduce boilerplate
springdoc-openapi-starter-webmvc-ui  2.5.0     ← Swagger UI
spring-boot-starter-test             (test)
```

---

## 3. Mobile (Capacitor 6 + Android)

### 3.1 Capacitor Dependencies

```json
// mobile/package.json
"@capacitor-community/barcode-scanner": "^4.0.1",
"@capacitor/android": "^6.2.0",
"@capacitor/cli": "^6.2.0",
"@capacitor/core": "^6.2.0"
```

### 3.2 Capacitor Config

```typescript
// mobile/capacitor.config.ts
const config: CapacitorConfig = {
    appId: 'com.trax.decorationscan',
    appName: 'Decoration Scan',
    webDir: '../frontend/dist',
    server: {
        // ★ QUAN TRỌNG: Trỏ thẳng vào frontend server qua HTTP
        // Khi frontend update trên server → app tự load bản mới
        // KHÔNG cần rebuild APK khi chỉ thay đổi frontend
        url: 'http://<SERVER_IP>:7779/',
        cleartext: true       // Cho phép HTTP (không HTTPS)
    },
    android: {
        allowMixedContent: true,  // Cho phép mix HTTP/HTTPS
    }
};
```

### 3.3 Android Dependencies (build.gradle)

```groovy
// CameraX (cho native camera preview)
def camerax_version = "1.3.1"
implementation "androidx.camera:camera-core:${camerax_version}"
implementation "androidx.camera:camera-camera2:${camerax_version}"
implementation "androidx.camera:camera-lifecycle:${camerax_version}"
implementation "androidx.camera:camera-view:${camerax_version}"

// ★ ML Kit Barcode Scanning (BUNDLED version — không cần Google Play Services)
implementation 'com.google.mlkit:barcode-scanning:17.2.0'
```

### 3.4 AndroidManifest — Permissions & Config

```xml
<!-- Permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Application: cho phép HTTP cleartext -->
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true">

    <!-- Main Activity: landscape mode -->
    <activity
        android:name=".MainActivity"
        android:screenOrientation="sensorLandscape"
        android:launchMode="singleTask" />

    <!-- MLKit Scanner: fullSensor (xoay tự do khi scan) -->
    <activity
        android:name=".MLKitScannerActivity"
        android:screenOrientation="fullSensor" />
</application>
```

---

## 4. ★ Hệ Thống Camera Scan Barcode (Chi Tiết)

> **ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT** — Kiến trúc dual-mode scanner đã được kiểm chứng
> ổn định trên production, hoạt động tốt qua **HTTP** (không cần HTTPS).
> Các dự án sau nên **copy nguyên hệ thống này** và chỉ thay đổi business logic.

### 4.1 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                  Html5QrcodePlugin.tsx                   │
│              (Frontend React Component)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─── Capacitor.isNativePlatform() ───┐                │
│  │                                     │                │
│  │  YES (APK)          NO (Browser)    │                │
│  │  ▼                  ▼               │                │
│  │  MLKitScanner       html5-qrcode    │                │
│  │  .scan()            Web Camera API  │                │
│  │                                     │                │
│  │  Native Java        JavaScript      │                │
│  │  CameraX + MLKit    getUserMedia    │                │
│  │  Full-screen        Inline preview  │                │
│  │                                     │                │
│  └─────────────────────────────────────┘                │
│                                                         │
│  ► handleValidScan(barcodeText, result)                 │
│  ► Validation: 10 chars (skipValidation flag)           │
│  ► Fallback: File capture mode (chụp ảnh)               │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Web Scanner — `html5-qrcode` (HTTP hoạt động tốt)

**Thư viện**: `html5-qrcode` v2.3.8  
**Vị trí**: `frontend/src/features/dashboard/components/Html5QrcodePlugin.tsx`  
**Giao thức**: **HTTP** ✅ (không cần HTTPS)

#### Tại sao hoạt động trên HTTP?
- Capacitor WebView (Android) cho phép `getUserMedia` trên HTTP vì app có quyền camera thông qua native permissions
- Trên desktop browser: `localhost` / LAN IP được Chrome cho phép camera qua HTTP
- **KHÔNG cần self-signed certificate**, không cần HTTPS config phức tạp

#### Config camera chuẩn

```typescript
// Barcode formats hỗ trợ
const BARCODE_FORMATS = [
    Html5QrcodeSupportedFormats.CODE_128,    // ★ Format chính cho barcode công nghiệp
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF
];

// Props interface
interface Html5QrcodePluginProps {
    fps?: number;                    // Frame per second (default 10)
    qrbox?: number | { width; height };  // Scan region size
    aspectRatio?: number;
    disableFlip?: boolean;
    skipValidation?: boolean;        // Bỏ qua check 10 chars
    enableQrCode?: boolean;          // Thêm QR_CODE format
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
    qrCodeErrorCallback?: (errorMessage: string, error: any) => void;
}
```

#### Luồng hoạt động Web Scanner

```
1. Mount component
2. Delay 500ms (đợi DOM ready)
3. Html5Qrcode.getCameras() — lấy danh sách camera
4. Ưu tiên back camera: regex /back|rear|environment|mặt sau/
5. Fallback: camera cuối cùng trong danh sách
6. scanner.start(cameraId, config, onSuccess, onError)
7. Mỗi frame decode → handleValidScan()
8. Validate: barcode phải đúng 10 ký tự (hoặc skip nếu skipValidation=true)
9. Unmount: scanner.stop() → scanner.clear()
```

#### Fallback — File Capture Mode

Khi camera không khả dụng (hoặc trên device không có camera API):
```typescript
// Chụp ảnh barcode → decode offline
<input type="file" accept="image/*" capture="environment" />
// scanner.scanFile(file, true) → decode từ ảnh
```

### 4.3 Native Scanner — MLKit (Android APK)

**3 file Java cần copy cho dự án mới:**

#### File 1: `MainActivity.java`
```java
// Đăng ký native plugin
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MLKitScannerPlugin.class);  // ★ Đăng ký MLKit
        super.onCreate(savedInstanceState);
    }
}
```

#### File 2: `MLKitScannerPlugin.java` — Capacitor Plugin Bridge
```java
@CapacitorPlugin(name = "MLKitScanner")
public class MLKitScannerPlugin extends Plugin {

    @PluginMethod
    public void scan(PluginCall call) {
        // Mở full-screen MLKitScannerActivity
        Intent intent = new Intent(getContext(), MLKitScannerActivity.class);
        startActivityForResult(call, intent, "scanResult");
    }

    @ActivityCallback
    private void scanResult(PluginCall call, ActivityResult result) {
        JSObject ret = new JSObject();
        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
            ret.put("hasContent", true);
            ret.put("content", result.getData().getStringExtra("barcode"));
            ret.put("format", result.getData().getStringExtra("format"));
        } else {
            ret.put("hasContent", false);  // User canceled
        }
        call.resolve(ret);
    }
}
```

#### File 3: `MLKitScannerActivity.java` — Native Scanner (Core)
```java
// ★ KIẾN TRÚC QUAN TRỌNG:
// - CameraX Preview: full-screen live camera
// - ML Kit BarcodeScanning: bundled model (không cần Google Play Services)
// - Debounce: yêu cầu 3 lần đọc liên tiếp giống nhau → tránh false positive
// - Barcode formats: CODE_128, CODE_39, QR_CODE, DATA_MATRIX, EAN_13, EAN_8,
//                    UPC_A, UPC_E, ITF, CODABAR

// Debounce logic (tránh scan sai)
private String lastScannedBarcode = "";
private int matchCount = 0;
private static final int REQUIRED_MATCH_COUNT = 3;  // ★ Cần 3 lần giống nhau

// Camera pipeline
ImageAnalysis → setAnalyzer → mỗi frame:
    1. InputImage.fromMediaImage(mediaImage, rotation)
    2. scanner.process(image)
    3. Nếu barcode == lastScannedBarcode → matchCount++
    4. Nếu barcode khác → reset matchCount = 1
    5. Khi matchCount >= 3 → finishActivityWithResult(barcode, format)
    6. Nếu frame không có barcode → matchCount = 0 (reset)
```

### 4.4 Frontend Integration — Cách gọi scanner

```typescript
// Từ bất kỳ feature component nào (PadPrint, Embroidery, Dashboard):
import Html5QrcodePlugin from "@/features/dashboard/components/Html5QrcodePlugin";

// Trong JSX:
<Html5QrcodePlugin
    fps={10}
    qrbox={250}
    disableFlip={false}
    skipValidation={false}         // true nếu barcode không phải 10 chars
    enableQrCode={false}           // true nếu cần scan cả QR code
    qrCodeSuccessCallback={(decodedText, decodedResult) => {
        // decodedText = "1234567890" (barcode string)
        handleBarcodeScan(decodedText);
    }}
/>

// Component tự detect:
// - Nếu chạy trong APK → gọi MLKitScanner.scan() native
// - Nếu chạy trên browser → dùng html5-qrcode web camera
// → Developer KHÔNG cần handle logic chọn scanner
```

### 4.5 Các Feature đang sử dụng Scanner

| Feature | File | Sử dụng |
|---------|------|---------|
| **Login** | `features/auth/components/RightLogin.tsx` | Scan badge để login |
| **Heat Transfer** | `features/dashboard/components/GridScanBarcode.tsx` | Scan barcode sản phẩm |
| **Pad Print** | `features/padprint/components/GridScanBarcodePP.tsx` | Scan barcode pad print |
| **Embroidery** | `features/embroidery/components/GridScanBarcodeEMB.tsx` | Scan barcode thêu |

### 4.6 ★ Checklist Copy Scanner Cho Dự Án Mới

```
□ Frontend:
  □ npm install html5-qrcode @capacitor/core
  □ Copy Html5QrcodePlugin.tsx → features/shared/components/
  □ Cấu hình BARCODE_FORMATS phù hợp dự án
  □ Điều chỉnh validation (10 chars → custom)

□ Mobile / Capacitor:
  □ npm install @capacitor/android @capacitor/cli @capacitor-community/barcode-scanner
  □ capacitor.config.ts: set server.url = HTTP (cleartext: true)
  □ Copy 3 file Java:
    □ MainActivity.java (registerPlugin)
    □ MLKitScannerPlugin.java (bridge)
    □ MLKitScannerActivity.java (native scanner)
  □ build.gradle: thêm CameraX + ML Kit dependencies
  □ AndroidManifest.xml:
    □ CAMERA permission
    □ usesCleartextTraffic="true"
    □ networkSecurityConfig
    □ MLKitScannerActivity declaration

□ Testing:
  □ Test trên browser HTTP (desktop) ✓
  □ Test trên WebView HTTP (tablet APK) ✓
  □ Test native MLKit scan (tablet APK) ✓
  □ Test file capture fallback ✓
  □ Test debounce (3 lần liên tiếp) ✓
```

---

## 5. Ghi Chú Kỹ Thuật Quan Trọng

### 5.1 HTTP vs HTTPS — Camera hoạt động trên HTTP

| Môi trường | Camera API | Hoạt động? | Lý do |
|-----------|-----------|-----------|-------|
| Desktop Chrome `localhost` | getUserMedia | ✅ | Secure context exception cho localhost |
| Desktop Chrome LAN IP (HTTP) | getUserMedia | ✅ | Chrome flag / dev allowance |
| Capacitor WebView (HTTP) | getUserMedia | ✅ | **Native permissions override** — Capacitor WebView cấp quyền camera thông qua AndroidManifest, không phụ thuộc HTTPS |
| Capacitor Native (MLKit) | CameraX native | ✅ | **Hoàn toàn native** — không liên quan web protocol |
| External browser (HTTP, non-localhost) | getUserMedia | ❌ | Cần HTTPS |

> **KẾT LUẬN**: Với kiến trúc Capacitor + HTTP server, camera scan **hoạt động ổn định 100%**
> mà KHÔNG cần HTTPS. Đây là lý do chọn kiến trúc này cho các dự án factory/nhà máy
> nơi setup HTTPS certificate trên mạng nội bộ phức tạp không cần thiết.

### 5.2 Lựa chọn Bundled vs Unbundled ML Kit

```
com.google.mlkit:barcode-scanning:17.2.0        ← BUNDLED (đang dùng ✅)
com.google.android.gms:play-services-mlkit:...   ← UNBUNDLED

★ BUNDLED: Model nhúng trong APK (~3MB lớn hơn)
  + KHÔNG cần Google Play Services
  + Hoạt động trên mọi Android device (kể cả Huawei, tablet công nghiệp)
  + Scan ngay lập tức, không cần download model
  - APK size lớn hơn ~3MB

★ UNBUNDLED: Download model từ Google
  - CẦN Google Play Services
  - Lần đầu cần Internet để download model
  - Không hoạt động trên thiết bị không có GMS
  + APK nhỏ hơn

→ LUÔN DÙNG BUNDLED cho dự án nhà máy / công nghiệp
```

### 5.3 Polyfills (Tablet cũ)

File `main.tsx` chứa polyfills cho Chrome cũ (Huawei tablet, Chrome < 92):
```
Array.prototype.at
String.prototype.at
Array.prototype.findLast
Array.prototype.findLastIndex
Object.hasOwn
structuredClone (fallback: JSON parse/stringify)
```

Vite config dùng `@vitejs/plugin-legacy` với target `chrome >= 60`.

### 5.4 State Management Stack

```
Zustand 5   → Global state (machines, scan data, shifts)
React Query → Server state caching (API data)
Preact Signals → Reactive global state (toast, shared)
React Context → App-wide providers (Auth, Theme, Locale, Loading)
```

---

## 6. Scripts & Build

```bash
# Frontend
npm run dev                    # Dev server (port 7779)
npm run build                  # Build staging
npm run build:production       # Build production

# Mobile
cd mobile
npm run build-android          # Build web → cap sync android
npm run sync                   # npx cap sync android
npm run open                   # Mở Android Studio
```

---

## 7. Tham Khảo Nhanh — Tạo Dự Án Mới

Khi tạo dự án scan barcode mới, copy theo thứ tự:

1. **Frontend skeleton**: `package.json` deps, `vite.config.ts`, path aliases
2. **Scanner module**: `Html5QrcodePlugin.tsx` + types
3. **Mobile skeleton**: `capacitor.config.ts`, `package.json`
4. **Android native**: 3 file Java (MainActivity, MLKitScannerPlugin, MLKitScannerActivity)
5. **Android config**: `build.gradle` deps, `AndroidManifest.xml`
6. **Backend skeleton**: `pom.xml`, SecurityConfig, ApiResponse wrapper
7. **Polyfills**: `main.tsx` polyfills block (nếu target tablet cũ)
