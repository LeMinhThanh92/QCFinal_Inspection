import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trax.decorationscan',
  appName: 'Decoration Scan',
  webDir: '../frontend/dist',
  server: {
    // Trỏ thẳng đến URL frontend trên server (port 7779 mặc định của start.ps1)
    // Khi frontend trên server update, app mở lên sẽ load bản mới luôn.
    url: 'http://172.17.100.199:7780/',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
