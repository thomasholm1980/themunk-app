import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.themunk.app',
  appName: 'The Munk – Stress',
  webDir: 'www',
  server: {
    url: 'https://themunk-app-web-git-feature-mons-82d1e7-thomholm-8188s-projects.vercel.app',
    cleartext: false,
    androidScheme: 'https',
    iosScheme: 'https',
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0a1f0d',
  },
  android: {
    backgroundColor: '#0a1f0d',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0a1f0d',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a1f0d',
    },
  },
};

export default config;
