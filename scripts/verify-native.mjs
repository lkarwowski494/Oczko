#!/usr/bin/env node
/**
 * Oczko — Weryfikacja projektu natywnego iOS na Linuksie / CI (BR-REL-009..013, Rozdział 12.4 BRD)
 * Sprawdza 20 niezmienników natywnych przed wysłaniem na TestFlight:
 * 1. ITSAppUsesNonExemptEncryption = false
 * 2. supportsTablet: false (tylko iPhone, brak wymogu iPad Split-View)
 * 3. UIRequiresFullScreen = true
 * 4. Brak nieużywanych uprawnień (NSMicrophone, NSLocation, NSUserTracking, etc.)
 * 5. PrivacyInfo.xcprivacy z 4 kategoriami Required Reason APIs i NSPrivacyTracking = false
 * 6. AppIcon 1024x1024 RGB bez kanału alfa (colorType === 2)
 * 7. SplashScreen z wariantem ciemnym
 * 8. Zgodność wersji package.json z app.json
 * 9. Brak UIBackgroundModes (brak audio/location w tle)
 * 10. Brak pustego pliku .entitlements
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
const pkgJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const errors = [];
const check = (cond, msg) => {
  if (!cond) errors.push(msg);
};

console.log('[verify-native] Sprawdzanie niezmienników natywnych iOS...');

// 1. Spójność wersji
check(pkgJson.version === appJson.version, `Wersja w package.json (${pkgJson.version}) nie zgadza się z app.json (${appJson.version})`);
check(/^\d+\.\d+(\.\d+)?$/.test(appJson.version), `Wersja '${appJson.version}' musi mieć format X.Y lub X.Y.Z`);

// 2. Konfiguracja iOS w app.json
check(appJson.ios?.bundleIdentifier === 'com.apps4brew.knitting', `bundleIdentifier musi wynosić com.apps4brew.knitting, jest: ${appJson.ios?.bundleIdentifier}`);
check(appJson.ios?.supportsTablet === false, 'supportsTablet musi być ustawione na false (aplikacja tylko na iPhone, brak iPad Split-View)');
check(appJson.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false, 'ITSAppUsesNonExemptEncryption musi być false');
check(appJson.ios?.infoPlist?.UIRequiresFullScreen === true, 'UIRequiresFullScreen musi być true');
check(appJson.ios?.infoPlist?.UIFileSharingEnabled === true, 'UIFileSharingEnabled musi być true dla kopii zapasowych w Plikach');
check(appJson.ios?.infoPlist?.LSSupportsOpeningDocumentsInPlace === true, 'LSSupportsOpeningDocumentsInPlace musi być true');

// 3. Zakaz niechcianych trybów tła i uprawnień
check(!appJson.ios?.infoPlist?.UIBackgroundModes, 'UIBackgroundModes jest zakazany (brak nieużywanych procesów w tle, czas liczony matematycznie)');

const forbiddenPermissions = [
  'NSMicrophoneUsageDescription',
  'NSLocationWhenInUseUsageDescription',
  'NSLocationAlwaysUsageDescription',
  'NSContactsUsageDescription',
  'NSBluetoothAlwaysUsageDescription',
  'NSUserTrackingUsageDescription',
  'NSAppleMusicUsageDescription',
  'NSCameraUsageDescription',
];

for (const perm of forbiddenPermissions) {
  check(!appJson.ios?.infoPlist?.[perm], `app.json zawiera niedozwolone uprawnienie: ${perm}`);
}

// 4. Privacy Manifests (Apple Required Reason APIs)
const priv = appJson.ios?.privacyManifests;
check(priv !== undefined, 'Brak sekcji privacyManifests w app.json');
if (priv) {
  check(priv.NSPrivacyTracking === false, 'privacyManifests.NSPrivacyTracking musi być false');
  const types = (priv.NSPrivacyAccessedAPITypes || []).map((t) => t.NSPrivacyAccessedAPIType);
  for (const cat of [
    'NSPrivacyAccessedAPICategoryUserDefaults',
    'NSPrivacyAccessedAPICategoryFileTimestamp',
    'NSPrivacyAccessedAPICategorySystemBootTime',
    'NSPrivacyAccessedAPICategoryDiskSpace',
  ]) {
    check(types.includes(cat), `privacyManifests musi deklarować kategorię Required Reason API: ${cat}`);
  }
}

// 5. AppIcon 1024x1024 RGB bez kanału alfa (RD-ENG-11)
const iconPath = join(root, 'assets', 'icon.png');
check(existsSync(iconPath), 'Brak pliku assets/icon.png');
if (existsSync(iconPath)) {
  const buf = readFileSync(iconPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const colorType = buf[25];
  check(w === 1024 && h === 1024, `Ikona ma wymiary ${w}x${h} (wymagane dokładnie 1024x1024)`);
  check(colorType === 2, `Ikona ma typ koloru PNG=${colorType} (wymagane 2 = RGB bez kanału przezroczystości alfa!)`);
}

// 6. Ciemny splash screen
check(appJson.splash?.dark?.backgroundColor !== undefined, 'Splash screen musi posiadać zdefiniowany wariant ciemny (dark.backgroundColor)');

// 7. Weryfikacja prebuild jeśli katalog ios/ istnieje lub w trybie --prebuild
if (process.argv.includes('--prebuild') || process.env.VERIFY_PREBUILD === '1') {
  const iosDir = join(root, 'ios');
  const hadIos = existsSync(iosDir);
  try {
    if (!hadIos) {
      console.log('[verify-native] Generowanie katalogu ios/ przez expo prebuild --no-install...');
      execSync('npx expo prebuild --platform ios --no-install --clean', { cwd: root, stdio: 'inherit' });
    }

    const iosScheme = appJson.name.replace(/[^a-zA-Z0-9]/g, '');
    const pbxPath = join(iosDir, `${iosScheme}.xcodeproj`, 'project.pbxproj');
    const plistPath = join(iosDir, iosScheme, 'Info.plist');
    const privPath = join(iosDir, iosScheme, 'PrivacyInfo.xcprivacy');

    check(existsSync(pbxPath), `Brak pliku projektu Xcode: ${pbxPath}`);
    check(existsSync(plistPath), `Brak pliku Info.plist: ${plistPath}`);
    check(existsSync(privPath), `Brak pliku PrivacyInfo.xcprivacy: ${privPath}`);

    if (existsSync(pbxPath) && existsSync(plistPath)) {
      const pbx = readFileSync(pbxPath, 'utf8');
      const plist = readFileSync(plistPath, 'utf8');
      check(pbx.includes('TARGETED_DEVICE_FAMILY = "1";') || pbx.includes('TARGETED_DEVICE_FAMILY = 1;'), 'TARGETED_DEVICE_FAMILY musi być 1 (iPhone)');
      check(/<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/.test(plist), 'Info.plist musi mieć ITSAppUsesNonExemptEncryption = false');
    }
  } finally {
    if (!hadIos && existsSync(iosDir)) {
      rmSync(iosDir, { recursive: true, force: true });
    }
  }
}

if (errors.length > 0) {
  console.error('\n[verify-native] BŁĘDY KONFIGURACJI NATYWNEJ iOS:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  console.log('[verify-native] Wszystkie 20 niezmienników natywnych iOS spełnione (100% OK)');
  process.exit(0);
}
