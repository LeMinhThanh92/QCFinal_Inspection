import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trax.sampleroomdigital',
  appName: 'QCFinal Inspection',
  webDir: '../frontend/dist',
  server: {
    url: 'http://172.17.100.199:7780/',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;