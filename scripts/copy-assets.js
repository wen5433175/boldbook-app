const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const wwwAssets = path.join(root, 'www', 'assets');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Missing asset: ${src}`);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${path.relative(root, dest)}`);
}

function copyDir(srcDir, destDir, filter = () => true) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`Missing asset dir: ${srcDir}`);
    return;
  }
  ensureDir(destDir);
  fs.readdirSync(srcDir)
    .filter(name => filter(name))
    .forEach(name => copyFile(path.join(srcDir, name), path.join(destDir, name)));
}

// Icons: local Lucide bundle (no network required at runtime)
copyFile(
  path.join(root, 'node_modules', 'lucide', 'dist', 'umd', 'lucide.min.js'),
  path.join(wwwAssets, 'icons', 'lucide.min.js')
);

// Fonts: copy every woff2 variant from fontsource packages
copyDir(
  path.join(root, 'node_modules', '@fontsource', 'space-grotesk', 'files'),
  path.join(wwwAssets, 'fonts'),
  name => name.endsWith('.woff2')
);

copyDir(
  path.join(root, 'node_modules', '@fontsource', 'jetbrains-mono', 'files'),
  path.join(wwwAssets, 'fonts'),
  name => name.endsWith('.woff2')
);

console.log('Asset copy complete.');
