import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wa.avatar',
  appName: 'WA Avatar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
