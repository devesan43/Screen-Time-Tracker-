import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  X,
  Smartphone,
  Github,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ApkGitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGitHubModal: React.FC<ApkGitHubModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'capacitor' | 'github'>('pwa');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const capacitorCommands = `# 1. Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor project
npx cap init "ChronosScreen" "com.chronos.screentime" --web-dir "dist"

# 3. Build Web Assets
npm run build

# 4. Add Android Platform & Open in Android Studio
npx cap add android
npx cap open android

# 5. Build signed APK in terminal or Android Studio
cd android && ./gradlew assembleDebug
# Generated APK will be in:
# android/app/build/outputs/apk/debug/app-debug.apk`;

  const androidManifestSnippet = `<!-- Add to android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.chronos.screentime">

    <!-- Crucial Android Permission for Screen Time & App Usage -->
    <uses-permission
        android:name="android.permission.PACKAGE_USAGE_STATS"
        tools:ignore="ProtectedPermissions" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <application
        android:allowBackup="true"
        android:label="ChronosScreen"
        android:theme="@style/AppTheme">
        <!-- Main Activity -->
    </application>
</manifest>`;

  const githubActionsWorkflow = `name: Build Android APK
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install dependencies & Build
        run: |
          npm install
          npm run build
      - name: Setup Java JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
      - name: Build Android APK with Capacitor
        run: |
          npx cap add android || true
          npx cap sync android
          cd android && ./gradlew assembleDebug
      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: chronos-screen-time-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Android APK & GitHub Setup Hub</h2>
            <p className="text-xs text-slate-400">
              Run natively on your Android device as an APK or publish to GitHub
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'pwa'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. Instant Android WebAPK</span>
          </button>

          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'capacitor'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Capacitor APK Build</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'github'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>3. GitHub Actions CI</span>
          </button>
        </div>

        {/* Tab 1: Instant PWA / WebAPK */}
        {activeTab === 'pwa' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Instant Install via Chrome on Android
                </span>
                {isInstalled && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Installed on this device
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                On Android, Google Chrome automatically generates a genuine native <strong>WebAPK</strong> when you install. It appears with its own app icon in your app drawer, supports notifications, runs standalone without browser address bars, and uses the exact theme color configured.
              </p>

              {isInstallable ? (
                <button
                  onClick={install}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 font-extrabold hover:from-sky-300 hover:to-indigo-400 transition shadow-lg shadow-sky-500/20"
                >
                  <Download className="w-4 h-4" /> Install ChronosScreen on Android Now
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-400">
                  <strong className="text-white block mb-1">How to Install on Mobile:</strong>
                  1. Open this URL in Chrome on your Android phone.<br />
                  2. Tap the three dots (⋮) menu in the top right.<br />
                  3. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <span className="font-semibold text-slate-200 block">Manifest Features Active:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Package ID: <code className="text-sky-400">/</code> (standalone display mode)</li>
                <li>Adaptive Icons: 192px, 512px, and 512px Android Maskable squircle safe zone</li>
                <li>Theme Status Bar: <code className="text-sky-400">#0F172A</code> matching system dark mode</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Capacitor APK Build */}
        {activeTab === 'capacitor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-sky-400" /> CLI Commands to Generate Standalone APK:
              </span>
              <button
                onClick={() => copyToClipboard(capacitorCommands, 'cap')}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
              >
                {copiedKey === 'cap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'cap' ? 'Copied!' : 'Copy Commands'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
                {capacitorCommands}
              </pre>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Android UsageStats Permission (for system-level screen tracking):
                </span>
                <button
                  onClick={() => copyToClipboard(androidManifestSnippet, 'manifest')}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                >
                  {copiedKey === 'manifest' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'manifest' ? 'Copied!' : 'Copy XML'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-300 font-mono overflow-x-auto">
                {androidManifestSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: GitHub Actions CI */}
        {activeTab === 'github' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block">Workflow File Already Created!</strong>
                <span><code>.github/workflows/build-apk.yml</code> and <code>capacitor.config.json</code> are configured in this project root.</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Whenever you push your code to GitHub, GitHub Actions will automatically install dependencies, set up the Android SDK, and compile a fresh <strong>ChronosScreen-debug.apk</strong> file.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">.github/workflows/build-apk.yml</span>
              <button
                onClick={() => copyToClipboard(githubActionsWorkflow, 'workflow')}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
              >
                {copiedKey === 'workflow' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'workflow' ? 'Copied!' : 'Copy Workflow'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-52">
              {githubActionsWorkflow}
            </pre>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <strong className="text-white block">How to Get Your APK on GitHub:</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Create a repository on GitHub (e.g. <code className="text-sky-400">chronos-screen-time</code>).</li>
                <li>Push this codebase:
                  <div className="mt-1 p-2 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-400">
                    git add . && git commit -m "feat: Add Android Screen Time monitor" && git push
                  </div>
                </li>
                <li>Click the <strong>Actions</strong> tab on your GitHub repository.</li>
                <li>Select the <strong>Build Android APK</strong> workflow run.</li>
                <li>Download the <strong>ChronosScreen-Android-APK</strong> artifact file directly to your phone!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
