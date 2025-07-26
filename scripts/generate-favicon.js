const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/logo without text.png');
const publicDir = path.join(__dirname, '../public');

// Favicon sizes we want to generate
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // Apple touch icon
  { size: 192, name: 'android-chrome-192x192.png' }, // Android Chrome
  { size: 512, name: 'android-chrome-512x512.png' }  // Android Chrome large
];

async function generateFavicons() {
  try {
    console.log('Starting favicon generation...');
    
    // Check if logo file exists
    if (!fs.existsSync(logoPath)) {
      console.error('Logo file not found at:', logoPath);
      return;
    }

    // Read the original logo
    const originalImage = sharp(logoPath);
    const metadata = await originalImage.metadata();
    console.log(`Original logo dimensions: ${metadata.width}x${metadata.height}`);

    // Generate different sized favicons
    for (const favicon of faviconSizes) {
      const outputPath = path.join(publicDir, favicon.name);
      
      await originalImage
        .resize(favicon.size, favicon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${favicon.name} (${favicon.size}x${favicon.size})`);
    }

    // Generate the main favicon.ico (16x16)
    const faviconIcoPath = path.join(publicDir, 'favicon.ico');
    await originalImage
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(faviconIcoPath.replace('.ico', '.png'));
    
    // Rename to .ico (browsers will accept PNG format even with .ico extension)
    fs.renameSync(faviconIcoPath.replace('.ico', '.png'), faviconIcoPath);
    console.log('✓ Generated favicon.ico');

    // Generate site.webmanifest for PWA support
    const webmanifest = {
      "name": "Research Flow",
      "short_name": "ResearchFlow",
      "icons": [
        {
          "src": "/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/android-chrome-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "theme_color": "#ffffff",
      "background_color": "#ffffff",
      "display": "standalone"
    };

    fs.writeFileSync(
      path.join(publicDir, 'site.webmanifest'),
      JSON.stringify(webmanifest, null, 2)
    );
    console.log('✓ Generated site.webmanifest');

    console.log('\nFavicon generation completed successfully!');
    console.log('Files generated:');
    console.log('- favicon.ico');
    console.log('- favicon-16x16.png');
    console.log('- favicon-32x32.png');
    console.log('- apple-touch-icon.png');
    console.log('- android-chrome-192x192.png');
    console.log('- android-chrome-512x512.png');
    console.log('- site.webmanifest');

  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

// Run the script
generateFavicons(); 