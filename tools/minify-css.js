const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
const minPath = path.join(__dirname, '..', 'css', 'style.min.css');
const css = fs.readFileSync(cssPath, 'utf8');
const broken = fs.readFileSync(minPath, 'utf8');

console.log('broken sample:', broken.slice(broken.indexOf('.container'), broken.indexOf('.container') + 120));
console.log('broken min() samples:', (broken.match(/min\([^)]{0,70}\)/g) || []).slice(0, 8));
console.log('broken clamp samples:', (broken.match(/clamp\([^)]{0,70}\)/g) || []).slice(0, 5));

/**
 * Safe minify: collapse whitespace, but NEVER strip commas inside functions.
 * Also keep spaces around + - / inside calc()/min()/clamp().
 */
function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;])\s*/g, '$1')
    .replace(/;}/g, '}')
    // Keep a space after commas (harmless, preserves readability of args)
    .replace(/,(?=\S)/g, ', ')
    .trim();
}

const min = minifyCss(css);
fs.writeFileSync(minPath, min);

console.log('\nfixed sample:', min.slice(min.indexOf('.container'), min.indexOf('.container') + 130));
console.log('fixed min() samples:', (min.match(/min\([^)]{0,70}\)/g) || []).slice(0, 8));
console.log('bytes', min.length);
console.log('has broken pattern 2.5remvar?', min.includes('2.5remvar'));
console.log('has 55%45%?', min.includes('55%45%'));
console.log('has underwater?', min.includes('underwater-showcase'));
