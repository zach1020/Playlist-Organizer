# 🍎 Capy's Amazing Playlist Organizer - Mac App

This document explains how to build and distribute the standalone Mac app version of Capy's Amazing Playlist Organizer.

## 🚀 Quick Start

### Development Mode
To run the app in development mode (with hot reload):
```bash
npm run electron-dev
```

### Build Mac App
To build a standalone Mac app:
```bash
npm run dist-mac
```

Or use the convenient build script:
```bash
./scripts/build-mac.sh
```

## 📦 What Gets Built

The build process creates several distribution formats:

- **`.dmg`** - Disk image for easy installation (drag & drop to Applications)
- **`.zip`** - Compressed archive for distribution
- **`.app`** - Direct application bundle

## 🎨 App Features

- **Native macOS Integration**: Proper menu bar, window controls, and system integration
- **Neumorphic Design**: Beautiful pseudo-3D interface with soft shadows
- **Spotify Integration**: Full playlist analysis and organization
- **Offline Capable**: Works without internet connection (except for Spotify API calls)
- **Responsive**: Adapts to different window sizes

## 🔧 Technical Details

### Architecture
- **Frontend**: Next.js with Neumorphic UI
- **Desktop Wrapper**: Electron
- **Build System**: electron-builder
- **Platform**: macOS (Intel & Apple Silicon)

### File Structure
```
├── electron/
│   └── main.js              # Electron main process
├── public/
│   ├── icon.png             # App icon
│   └── icon.ico             # Windows icon (for compatibility)
├── build/
│   └── entitlements.mac.plist # macOS code signing entitlements
└── scripts/
    ├── generate-icon.js     # Icon generation script
    └── build-mac.sh         # Build script
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- macOS (for building Mac apps)

### Available Scripts
- `npm run electron-dev` - Run in development mode
- `npm run electron` - Run built app
- `npm run dist-mac` - Build Mac app
- `npm run dist` - Build for all platforms

### Customization

#### App Icon
The app icon is generated from an SVG template. To modify:
1. Edit `public/icon.svg`
2. Run `node scripts/generate-icon.js`

#### App Metadata
Modify `package.json` build section:
- `appId` - Unique app identifier
- `productName` - Display name
- `category` - App Store category

## 📱 Distribution

### Code Signing (Optional)
For distribution outside the Mac App Store, you may want to code sign:

1. Get an Apple Developer certificate
2. Update `build/entitlements.mac.plist` if needed
3. Set environment variables for signing

### Notarization (Optional)
For distribution without security warnings:

1. Upload to Apple for notarization
2. Staple the notarization ticket
3. Distribute the final app

## 🐛 Troubleshooting

### Common Issues

**Build fails with "icon not found"**
- Run `node scripts/generate-icon.js` to create icons

**App won't start**
- Check that Next.js build completed successfully
- Verify `out/` directory exists with static files

**Electron app shows blank screen**
- Check console for errors
- Verify the app is loading from correct URL

### Debug Mode
Run with developer tools:
```bash
npm run electron-dev
```
This opens the app with DevTools enabled.

## 🎯 Next Steps

- [ ] Add auto-updater functionality
- [ ] Implement native file system access
- [ ] Add system tray integration
- [ ] Create installer with custom branding
- [ ] Submit to Mac App Store (requires Apple Developer account)

## 📄 License

Same as the main project - see main README for details.
