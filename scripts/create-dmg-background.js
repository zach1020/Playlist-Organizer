const sharp = require('sharp');

async function createDMGBackground() {
  const width = 600;
  const height = 400;
  
  // Create a simple gradient background
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e0e5ec"/>
          <stop offset="100%" style="stop-color:#d1d9e6"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Add some subtle neumorphic elements -->
      <circle cx="100" cy="100" r="30" fill="#e0e5ec" stroke="#bebebe" stroke-width="2" opacity="0.3"/>
      <circle cx="500" cy="300" r="40" fill="#e0e5ec" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
      
      <!-- App name -->
      <text x="300" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#4a5568">Capy's Amazing</text>
      <text x="300" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#4a5568">Playlist Organizer</text>
    </svg>
  `;

  try {
    await sharp(Buffer.from(svg))
      .png()
      .resize(width, height)
      .toFile('public/dmg-background.png');

    console.log('✅ DMG background created successfully!');
  } catch (error) {
    console.error('❌ Error creating DMG background:', error);
  }
}

createDMGBackground();
