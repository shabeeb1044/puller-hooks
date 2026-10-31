const fs = require('fs');
const path = require('path');

const order = [
  '31', '33', '34', '32', '35', '37', '38', '16', '29', '28', '27', '30',
  '23', '26', '25', '24', '22', '21', '19', '20', '17', '18', '36', '15',
  '10', '09', '08', '05', '03', '02', '14', '13', '12', '11', '07', '06',
  '01', '04',
];

const dir = path.join(__dirname, '..', 'products');
const items = order.map((id, i) => {
  const html = fs.readFileSync(path.join(dir, `flash-striker-${id}.html`), 'utf8');
  const m = html.match(
    new RegExp(`flash-striker-160-dd-${id}\\.webp"[^>]*height="(\\d+)"`)
  );
  const height = m ? Number(m[1]) : 524;
  return {
    id,
    height,
    prev: order[(i + order.length - 1) % order.length],
    next: order[(i + 1) % order.length],
  };
});

fs.writeFileSync(
  path.join(__dirname, '..', 'lib', 'catalog.json'),
  JSON.stringify({ order, items }, null, 2)
);
console.log('Wrote lib/catalog.json with', items.length, 'items');
