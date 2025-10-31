import type { CapacitorConfig } from '@capacitor/cli';

const DEFAULT_SERVER_URL = 'https://webosumania.com';

const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() || DEFAULT_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.webosumania.app',
  appName: 'Web OsuMania',
  webDir: 'public',
  server: {
    url: serverUrl,
    // Allow local cleartext domains (e.g. http://10.0.2.2:3000) during debugging.
    cleartext: serverUrl.startsWith('http://')
  },
  android: { allowMixedContent: false }
};

export default config;
