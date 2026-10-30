import fs from 'fs';
import path from 'path';

const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');

export function configureAndroidManifest() {
  if (!fs.existsSync(manifestPath)) {
    console.log('AndroidManifest.xml not found yet at:', manifestPath);
    return;
  }

  let content = fs.readFileSync(manifestPath, 'utf8');

  // 1. Ensure xmlns:tools namespace exists so tools:ignore is valid XML
  if (!content.includes('xmlns:tools=')) {
    content = content.replace(
      '<manifest',
      '<manifest xmlns:tools="http://schemas.android.com/tools"'
    );
  }

  // 2. Insert required permissions cleanly before <application>
  if (!content.includes('PACKAGE_USAGE_STATS')) {
    const permissions = `
    <!-- Android Screen Time & Usage Stats Permissions -->
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

`;
    content = content.replace(/<application/, `${permissions}    <application`);
  }

  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log('✅ AndroidManifest.xml successfully configured with valid XML namespaces and permissions.');
}

configureAndroidManifest();
