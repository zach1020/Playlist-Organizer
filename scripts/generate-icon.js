const sharp = require('sharp');
const fs = require('fs');

// Create a simple icon using sharp
async function generateIcon() {
  const size = 512;
  
  // Create a simple gradient background
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e0e5ec"/>
          <stop offset="100%" style="stop-color:#d1d9e6"/>
        </linearGradient>
        <linearGradient id="capy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6"/>
          <stop offset="100%" style="stop-color:#7c3aed"/>
        </linearGradient>
      </defs>
      
      <rect width="${size}" height="${size}" rx="80" fill="url(#bg)"/>
      
      <!-- Capybara head -->
      <ellipse cx="256" cy="200" rx="120" ry="80" fill="url(#capy)"/>
      
      <!-- Ears -->
      <ellipse cx="200" cy="150" rx="25" ry="35" fill="url(#capy)"/>
      <ellipse cx="312" cy="150" rx="25" ry="35" fill="url(#capy)"/>
      
      <!-- Eyes -->
      <circle cx="220" cy="180" r="12" fill="#ffffff"/>
      <circle cx="292" cy="180" r="12" fill="#ffffff"/>
      <circle cx="220" cy="180" r="6" fill="#2d3748"/>
      <circle cx="292" cy="180" r="6" fill="#2d3748"/>
      
      <!-- Nose -->
      <ellipse cx="256" cy="210" rx="8" ry="6" fill="#2d3748"/>
      
      <!-- Music note -->
      <g transform="translate(256, 320)">
        <circle cx="0" cy="-20" r="15" fill="url(#capy)"/>
        <rect x="-3" y="-5" width="6" height="40" fill="url(#capy)"/>
        <rect x="-3" y="35" width="20" height="6" fill="url(#capy)"/>
      </g>
      
      <!-- Text -->
      <text x="256" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#4a5568">CAPY</text>
    </svg>
  `;

  try {
    // Generate PNG icon
    await sharp(Buffer.from(svg))
      .png()
      .resize(size, size)
      .toFile('public/icon.png');

    // Generate ICO icon (for Windows compatibility)
    await sharp(Buffer.from(svg))
      .png()
      .resize(256, 256)
      .toFile('public/icon.ico');

    console.log('✅ Icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcon();
