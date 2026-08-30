const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Explicit resolution for monorepo packages
config.resolver.extraNodeModules = {
  '@andrea/crypto-core': path.resolve(monorepoRoot, 'packages/crypto-core'),
  '@andrea/types': path.resolve(monorepoRoot, 'packages/types'),
};

// 4. Support AVIF image assets
if (!config.resolver.assetExts.includes('avif')) {
  config.resolver.assetExts.push('avif');
}

module.exports = config;
