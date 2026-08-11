import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notkrish96.omniagent',
  appName: 'Omni-Agent',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
