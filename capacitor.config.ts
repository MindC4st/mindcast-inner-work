import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor shells (iOS + Android) wrap the existing Vite web build. The web
// app is the single shared core; the native shells add Core NFC / Android NFC
// for bracelet check-in. See PHASE_0_1_IMPLEMENTATION_NOTES.md for the native
// setup + App Store steps (this repo scaffolds config only — the ios/ and
// android/ native projects are generated with `npx cap add` on a dev machine
// with Xcode / Android Studio).

const config: CapacitorConfig = {
  appId: "co.nz.mindcast.app",
  appName: "Mindcast",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    // @capacitor-community/nfc — bracelet reads. iOS requires the Core NFC
    // entitlement + NFCReaderUsageDescription in Info.plist.
  },
};

export default config;
