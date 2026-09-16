// Run with: node generate-icons.js
// Creates PWA icons using canvas

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createIcon(size, filepath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#07101d');
  grad.addColorStop(1, '#123354');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  
  // Rounded corners mask
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.167;
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  
  // Dumbbell emoji as text (fallback)
  ctx.font = `bold ${size * 0.5}px system-ui`;
  ctx.fillStyle = '#22c55e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💪', size / 2, size / 2 + size * 0.02);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`Created: ${filepath} (${size}x${size})`);
}

const publicDir = path.join(__dirname, 'public');
createIcon(192, path.join(publicDir, 'pwa-192x192.png'));
createIcon(512, path.join(publicDir, 'pwa-512x512.png'));
createIcon(180, path.join(publicDir, 'apple-touch-icon.png'));
console.log('Done!');