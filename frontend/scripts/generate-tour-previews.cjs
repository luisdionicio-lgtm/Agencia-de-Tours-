const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../public/tour-galleries');

async function generate(directory) {
  let count = 0;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) count += await generate(file);
    else if (entry.isFile() && entry.name.endsWith('.webp') && !entry.name.endsWith('-preview.webp')) {
      await sharp(file).resize(640, 640, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(file.replace(/\.webp$/, '-preview.webp'));
      count++;
    }
  }
  return count;
}
generate(root).then(count => console.log(`Generated ${count} lightweight tour previews.`)).catch(error => { console.error(error); process.exitCode = 1; });
