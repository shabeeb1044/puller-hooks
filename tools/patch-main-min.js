const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'js', 'main.min.js');
let m = fs.readFileSync(p, 'utf8');
const old = 'sections=topLinks.map(l=>$(l.getAttribute("href"))).filter(Boolean)';
const neu =
  'sections=topLinks.map(l=>{const href=l.getAttribute("href")||"";return href.startsWith("#")?$(href):null}).filter(Boolean)';

if (!m.includes(old)) {
  console.error('pattern not found');
  process.exit(1);
}

m = m.replace(old, neu);
fs.writeFileSync(p, m);
console.log('updated ok');
