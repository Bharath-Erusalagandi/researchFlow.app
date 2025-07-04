const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const publicDir = path.join(__dirname, '..', 'public');
  const imagesDir = path.join(publicDir, 'images');
  
  // Create images directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  try {
    console.log('🖼️  Starting image optimization...');

    // Optimize the large Cambridge University image
    const cambridgeImage = path.join(publicDir, 'cambridge-university-image.png');
    
    if (fs.existsSync(cambridgeImage)) {
      console.log('📸 Optimizing Cambridge University image...');
      
      // Create multiple formats and sizes
      const formats = [
        { suffix: '-large', width: 1920, quality: 85 },
        { suffix: '-medium', width: 1200, quality: 80 },
        { suffix: '-small', width: 800, quality: 75 },
        { suffix: '-thumbnail', width: 400, quality: 70 }
      ];

      for (const format of formats) {
        // WebP format
        await sharp(cambridgeImage)
          .resize(format.width, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .webp({ quality: format.quality })
          .toFile(path.join(imagesDir, `cambridge-university${format.suffix}.webp`));

        // AVIF format (better compression)
        await sharp(cambridgeImage)
          .resize(format.width, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .avif({ quality: format.quality - 10 })
          .toFile(path.join(imagesDir, `cambridge-university${format.suffix}.avif`));

        // Fallback JPEG
        await sharp(cambridgeImage)
          .resize(format.width, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality: format.quality, progressive: true })
          .toFile(path.join(imagesDir, `cambridge-university${format.suffix}.jpg`));
      }

      console.log('✅ Cambridge University image optimized in multiple formats');
    }

    // Optimize any other images in the public directory
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const files = fs.readdirSync(publicDir);
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext) && file !== 'cambridge-university-image.png') {
        const inputPath = path.join(publicDir, file);
        const outputName = path.basename(file, ext);
        
        console.log(`📸 Optimizing ${file}...`);
        
        // Create optimized versions
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(path.join(imagesDir, `${outputName}.webp`));
          
        await sharp(inputPath)
          .jpeg({ quality: 80, progressive: true })
          .toFile(path.join(imagesDir, `${outputName}.jpg`));
      }
    }

    console.log('🎉 Image optimization complete!');
    console.log(`📁 Optimized images saved to: ${imagesDir}`);
    
    // Show size comparison
    const originalSize = fs.statSync(cambridgeImage).size;
    const optimizedSize = fs.statSync(path.join(imagesDir, 'cambridge-university-medium.webp')).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`💾 Size reduction: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`);

  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  optimizeImages();
}

module.exports = { optimizeImages }; 