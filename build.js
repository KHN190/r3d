#!/usr/bin/env node
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  platform: null,
  debug: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--platform' || args[i] === '-p') {
    flags.platform = args[i + 1];
    i++;
  } else if (args[i] === '--debug' || args[i] === '-d') {
    flags.debug = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: npm run build [options]

Options:
  -p, --platform <name>   Target platform: mac-x64, mac-arm64, win
  -d, --debug            Build in debug mode
  -h, --help             Show this help

Examples:
  npm run build                          # Build for current platform (release)
  npm run build -- -p mac-x64            # Build for macOS x64 (release)
  npm run build -- -p mac-x64 -d         # Build for macOS x64 (debug)
  npm run build -- --debug               # Build for current platform (debug)
`);
    process.exit(0);
  }
}

// Platform configurations
const platforms = {
  'mac-x64': {
    target: 'x86_64-apple-darwin',
    qsBuild: 'build:mac-x64'
  },
  'mac-arm64': {
    target: 'aarch64-apple-darwin',
    qsBuild: 'build:mac'
  },
  'win': {
    target: 'x86_64-pc-windows-msvc',
    qsBuild: 'build:win'
  }
};

// Auto-detect platform if not specified
if (!flags.platform) {
  const os = process.platform;
  const arch = process.arch;
  if (os === 'darwin') {
    flags.platform = arch === 'arm64' ? 'mac-arm64' : 'mac-x64';
  } else if (os === 'win32') {
    flags.platform = 'win';
  } else {
    console.error('❌ Unsupported platform. Use --platform to specify.');
    console.error('Available platforms:', Object.keys(platforms).join(', '));
    process.exit(1);
  }
}

const platformConfig = platforms[flags.platform];
if (!platformConfig) {
  console.error(`❌ Unknown platform: ${flags.platform}`);
  console.error('Available platforms:', Object.keys(platforms).join(', '));
  process.exit(1);
}

console.log(`\n🔨 Building for: ${flags.platform}${flags.debug ? ' (debug)' : ' (release)'}\n`);

// Execute build
try {
  // 1. Build quickdraw-server
  console.log('📦 Building quickdraw-server...');
  execSync(`cd quickdraw-server && npm install && npm run ${platformConfig.qsBuild}`, {
    stdio: 'inherit'
  });

  // 2. Prepare frontend assets
  console.log('\n📂 Preparing frontend assets...');
  execSync('npm run prepare:dist', {
    stdio: 'inherit'
  });

  // 3. Build Tauri
  console.log('\n🦀 Building Tauri app...');
  const tauriArgs = [
    'tauri build',
    `--target ${platformConfig.target}`,
    flags.debug ? '--debug' : ''
  ].filter(Boolean).join(' ');

  execSync(tauriArgs, {
    stdio: 'inherit'
  });

  const mode = flags.debug ? 'debug' : 'release';
  console.log('\n✅ Build complete!');
  console.log(`📍 Output: src-tauri/target/${platformConfig.target}/${mode}/bundle/\n`);
} catch (error) {
  console.error('\n❌ Build failed');
  process.exit(1);
}