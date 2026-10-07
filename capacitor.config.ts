import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.smri.spacecleanupstation',
  appName: 'Space Cleanup Station',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
