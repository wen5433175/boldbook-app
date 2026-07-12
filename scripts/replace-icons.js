const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\Administrator\\AppData\\Roaming\\TRAE SOLO CN\\ModularData\\ai-agent\\work-mode-projects\\6a526510966c553c6b63e94b\\boldbook-app';
const iconSrc = path.join(base, '原型设计图', 'App 图标.png');
const splashSrc = path.join(base, '原型设计图', '载入画面.png');

async function run() {
  const iconDensities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  const resDir = path.join(base, 'android', 'app', 'src', 'main', 'res');

  // 1. Replace App Icons
  for (const [density, size] of Object.entries(iconDensities)) {
    const mipDir = path.join(resDir, 'mipmap-' + density);
    const img = sharp(iconSrc).resize(size, size);
    await img.clone().toFile(path.join(mipDir, 'ic_launcher.png'));
    await img.clone().toFile(path.join(mipDir, 'ic_launcher_round.png'));
    await img.clone().toFile(path.join(mipDir, 'ic_launcher_foreground.png'));
    await img.clone().toFile(path.join(mipDir, 'ic_launcher_background.png'));
    console.log('Icon', density, size + 'px OK');
  }

  // 2. Replace Splash screens (portrait + landscape)
  const splashDensities = {
    mdpi: { w: 320, h: 480 },
    hdpi: { w: 480, h: 800 },
    xhdpi: { w: 720, h: 1280 },
    xxhdpi: { w: 960, h: 1600 },
    xxxhdpi: { w: 1280, h: 1920 }
  };
  for (const [density, dims] of Object.entries(splashDensities)) {
    await sharp(splashSrc).resize(dims.w, dims.h).toFile(path.join(resDir, 'drawable-port-' + density, 'splash.png'));
    await sharp(splashSrc).resize(dims.h, dims.w).toFile(path.join(resDir, 'drawable-land-' + density, 'splash.png'));
    console.log('Splash', density, dims.w + 'x' + dims.h + ' OK');
  }
  // Also write base splash for fallback
  await sharp(splashSrc).resize(1080, 1920).toFile(path.join(resDir, 'drawable', 'splash.png'));
  console.log('Base splash OK');

  // 3. Remove splash.xml so PNG is used instead
  const splashXml = path.join(resDir, 'drawable', 'splash.xml');
  if (fs.existsSync(splashXml)) {
    fs.unlinkSync(splashXml);
    console.log('Removed splash.xml');
  }

  // 4. Update adaptive icon XML
  const anydpiDir = path.join(resDir, 'mipmap-anydpi-v26');
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'),
    '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n' +
    '    <background android:drawable="@mipmap/ic_launcher_background"/>\n' +
    '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n' +
    '</adaptive-icon>\n');
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'),
    '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n' +
    '    <background android:drawable="@mipmap/ic_launcher_background"/>\n' +
    '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n' +
    '</adaptive-icon>\n');
  
  // 5. Clean up old splash PNGs in drawable-port-* and drawable-land-* (non-density specific ones)
  console.log('All done!');
}

run().catch(e => { console.error(e); process.exit(1); });
