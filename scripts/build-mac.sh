#!/bin/bash

echo "🚀 Building Capy's Amazing Playlist Organizer for macOS..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf out/

# Generate icons
echo "🎨 Generating app icons..."
node scripts/generate-icon.js

# Build the Next.js app
echo "📦 Building Next.js app..."
npm run build

# Export static files
echo "📤 Exporting static files..."
npm run export

# Build the Mac app
echo "🍎 Building macOS app..."
npm run dist-mac

echo "✅ Build complete! Check the 'dist' folder for your Mac app."
echo "📁 You'll find:"
echo "   - .dmg file for easy installation"
echo "   - .zip file for distribution"
echo "   - .app bundle for direct use"
