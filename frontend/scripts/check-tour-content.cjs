const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const result = { exports: {} };
  new Function('module', 'exports', compiled.outputText)(result, result.exports);
  return result.exports;
}
const { matchesDestination } = load('src/features/tours/utils/destinationMatch.ts');
assert.equal(matchesDestination('Tarapoto y naturaleza amazónica', 'ica'), false);
assert.equal(matchesDestination('República Dominicana', 'ica'), false);
assert.equal(matchesDestination('Ica y Huacachina', 'ica'), true);
assert.equal(matchesDestination('Máncora, Punta Sal y Tumbes', 'mancora'), true);
assert.equal(matchesDestination('Río de Janeiro, Brasil', 'río de janeiro'), true);
assert.equal(matchesDestination('Cusco–Puno–Arequipa', 'puno'), true);
assert.equal(matchesDestination('Tarapoto', ''), false);
const { tourMediaBySlug, tourPhotoPreview } = load('src/features/tours/config/tourMedia.ts');
for (const gallery of Object.values(tourMediaBySlug)) {
  assert.ok(gallery.items.length > 0);
  assert.equal(new Set(gallery.items.map(item => item.image)).size, gallery.items.length);
  for (const item of gallery.items) {
    assert.ok(item.alt && item.title && item.stage);
    assert.ok(fs.existsSync(path.join(root, 'public', item.image)), `Missing image: ${item.image}`);
    assert.ok(fs.existsSync(path.join(root, 'public', tourPhotoPreview(item.image))), `Missing preview: ${item.image}`);
  }
}
const { itineraryCatalog } = load('src/features/tours/config/itineraryCatalog.ts');
assert.equal(new Set(itineraryCatalog.map(item => item.id)).size, itineraryCatalog.length);
const europe = itineraryCatalog.find(item => item.id === 'bienvenidos-europa');
assert.equal(europe.days.length, 17);
assert.equal(europe.referenceOnly, true);
console.log('OK: destination matching, gallery files, unique itineraries and 17-day Europe variant.');
