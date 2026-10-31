/**
 * Extract <main> from static HTML and write Next.js page modules
 * that render the same markup (design/content preserved).
 */
const fs = require('fs');
const path = require('path');
const { htmlToJsx, rewriteLinks } = require('./html-to-jsx');

const root = path.join(__dirname, '..');

function extractMain(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!m) throw new Error('No <main> found');
  return m[0];
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/&amp;/g, '&').trim() : 'PULLER Co., Ltd.';
}

function extractMeta(html, name) {
  const re = new RegExp(
    `<meta\\s+name="${name}"\\s+content="([^"]*)"`,
    'i'
  );
  const m = html.match(re);
  return m ? m[1] : '';
}

function extractOg(html, prop) {
  const re = new RegExp(
    `<meta\\s+property="${prop}"\\s+content="([^"]*)"`,
    'i'
  );
  const m = html.match(re);
  return m ? m[1] : '';
}

function extractJsonLd(html) {
  const m = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
  );
  return m ? m[1].trim() : null;
}

function pageModule({ route, title, description, ogImage, jsonLd, mainJsx, extraHead = '' }) {
  const desc = description || '';
  const image = (ogImage || '/images/og-image.webp').replace(
    /^https:\/\/pullertackle\.com/,
    ''
  );
  const absImage = image.startsWith('http')
    ? image
    : `https://pullertackle.com${image.startsWith('/') ? '' : '/'}${image}`;

  return `import { HtmlMain } from '@/components/HtmlMain';

export const metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(desc.replace(/&amp;/g, '&'))},
  openGraph: {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify((extractPlain(desc) || desc).replace(/&amp;/g, '&'))},
    images: [{ url: ${JSON.stringify(absImage)} }],
    siteName: 'PULLER Co., Ltd.',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(desc.replace(/&amp;/g, '&'))},
    images: [${JSON.stringify(absImage)}],
  },
  alternates: {
    canonical: ${JSON.stringify('https://pullertackle.com' + route)},
  },
};

const MAIN_HTML = ${JSON.stringify(mainJsx)};

${jsonLd ? `const JSON_LD = ${JSON.stringify(jsonLd)};` : ''}

export default function Page() {
  return (
    <>
      ${jsonLd ? `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />` : ''}
      <HtmlMain html={MAIN_HTML} />
    </>
  );
}
`;
}

function extractPlain(s) {
  return s;
}

function processFile(relPath, route) {
  const abs = path.join(root, relPath);
  const html = fs.readFileSync(abs, 'utf8');
  let main = extractMain(html);
  main = rewriteLinks(main);
  // Keep as HTML string for HtmlMain (dangerouslySetInnerHTML) — more faithful
  const title = extractTitle(html)
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
  const description = extractMeta(html, 'description') || extractOg(html, 'og:description');
  let ogImage = extractOg(html, 'og:image') || '/images/og-image.webp';
  ogImage = rewriteLinks(`src="${ogImage}"`).replace(/^src="/, '').replace(/"$/, '');
  if (ogImage.startsWith('images/')) ogImage = '/' + ogImage;
  if (ogImage.startsWith('../')) ogImage = ogImage.replace(/^\.\.\//, '/');
  const jsonLd = extractJsonLd(html);
  let jsonLdRewritten = jsonLd;
  if (jsonLdRewritten) {
    jsonLdRewritten = jsonLdRewritten
      .replace(/\.html"/g, '"')
      .replace(/flash-striker-(\d{2})"/g, 'flash-striker/$1"');
  }

  const outDir = path.join(root, 'app', ...route.split('/').filter(Boolean));
  fs.mkdirSync(outDir, { recursive: true });
  const code = pageModule({
    route: route === '' ? '/' : route,
    title,
    description,
    ogImage,
    jsonLd: jsonLdRewritten,
    mainJsx: main,
  });
  fs.writeFileSync(path.join(outDir, 'page.js'), code);
  console.log('Wrote', path.relative(root, path.join(outDir, 'page.js')));
}

// Fix pageModule - remove unused htmlToJsx for now, use HTML strings
function pageModuleFixed({ route, title, description, ogImage, jsonLd, mainHtml }) {
  const desc = (description || '').replace(/&amp;/g, '&');
  let image = ogImage || '/images/og-image.webp';
  image = image.replace(/^https:\/\/pullertackle\.com/, '');
  if (!image.startsWith('/') && !image.startsWith('http')) image = '/' + image;
  const absImage = image.startsWith('http')
    ? image
    : `https://pullertackle.com${image}`;

  return `import { HtmlMain } from '@/components/HtmlMain';

export const metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(desc)},
  openGraph: {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(desc)},
    images: [{ url: ${JSON.stringify(absImage)} }],
    siteName: 'PULLER Co., Ltd.',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(desc)},
    images: [${JSON.stringify(absImage)}],
  },
  alternates: {
    canonical: ${JSON.stringify('https://pullertackle.com' + (route === '/' ? '/' : route))},
  },
};

const MAIN_HTML = ${JSON.stringify(mainHtml)};
${jsonLd ? `\nconst JSON_LD = ${JSON.stringify(jsonLd)};\n` : ''}
export default function Page() {
  return (
    <>
      ${jsonLd ? `<script\n        type="application/ld+json"\n        dangerouslySetInnerHTML={{ __html: JSON_LD }}\n      />` : ''}
      <HtmlMain html={MAIN_HTML} />
    </>
  );
}
`;
}

function process(relPath, route) {
  const abs = path.join(root, relPath);
  const html = fs.readFileSync(abs, 'utf8');
  let main = extractMain(html);
  main = rewriteLinks(main);
  const title = extractTitle(html).replace(/&amp;/g, '&');
  const description =
    extractMeta(html, 'description') || extractOg(html, 'og:description') || '';
  let ogImage = extractOg(html, 'og:image') || '/images/og-image.webp';
  ogImage = ogImage
    .replace(/^https:\/\/pullertackle\.com/, '')
    .replace(/^\.\.\//, '/')
    .replace(/^images\//, '/images/');
  if (!ogImage.startsWith('/') && !ogImage.startsWith('http')) ogImage = '/' + ogImage;

  let jsonLd = extractJsonLd(html);
  if (jsonLd) {
    jsonLd = jsonLd
      .replace(/\/products\/flash-striker-(\d{2})\.html/g, '/products/flash-striker/$1')
      .replace(/\.html"/g, '"')
      .replace(/\.html\//g, '/');
  }

  const segments = route === '/' ? [] : route.split('/').filter(Boolean);
  const outDir = path.join(root, 'app', ...segments);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'page.js'),
    pageModuleFixed({
      route,
      title,
      description,
      ogImage,
      jsonLd,
      mainHtml: main,
    })
  );
  console.log('Wrote app/' + (segments.length ? segments.join('/') + '/' : '') + 'page.js');
}

const pages = [
  ['index.html', '/'],
  ['contact.html', '/contact'],
  ['dealers.html', '/dealers'],
  ['our-story.html', '/our-story'],
  ['products/hooks.html', '/products/hooks'],
  ['products/flash-striker.html', '/products/flash-striker'],
];

for (const [file, route] of pages) process(file, route);

// Dynamic PDP template — write a single [id]/page.js instead of 38 files
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'lib', 'catalog.json'), 'utf8')
);
const pdpDir = path.join(root, 'app', 'products', 'flash-striker', '[id]');
fs.mkdirSync(pdpDir, { recursive: true });

const sample = fs.readFileSync(
  path.join(root, 'products', 'flash-striker-01.html'),
  'utf8'
);
// Build heights map
const heights = Object.fromEntries(catalog.items.map((i) => [i.id, i.height]));
const prevMap = Object.fromEntries(catalog.items.map((i) => [i.id, i.prev]));
const nextMap = Object.fromEntries(catalog.items.map((i) => [i.id, i.next]));

const pdpPage = `import { notFound } from 'next/navigation';
import { HtmlMain } from '@/components/HtmlMain';
import { getProduct, getAllIds } from '@/lib/catalog';

export function generateStaticParams() {
  return getAllIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return {};
  const title = \`FLASH STRIKER — \${id} | PULLER Co., Ltd.\`;
  const description = \`PULLER FLASH STRIKER. 2m +. YOUR PERFECT CATCHER. Catalogue image \${id} of 38.\`;
  const image = \`https://pullertackle.com/images/products/flash-striker-160-dd-\${id}.webp\`;
  const url = \`https://pullertackle.com/products/flash-striker/\${id}\`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, alt: 'FLASH STRIKER, 2m +' }],
      siteName: 'PULLER Co., Ltd.',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

function buildMain(id, product) {
  return \`<main id="main">
    <article class="pdp">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="/#products">Products</a>
        <span aria-hidden="true">/</span>
        <span>Hard Body Lures</span>
        <span aria-hidden="true">/</span>
        <a href="/products/flash-striker">FLASH STRIKER</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">\${id}</span>
      </nav>
        <div class="pdp-layout">
          <div class="pdp-media">
            <img src="/images/products/flash-striker-160-dd-\${id}.webp" alt="FLASH STRIKER, 2m +" width="1680" height="\${product.height}" decoding="async" />
          </div>
          <div class="pdp-copy">
            <p class="section-eyebrow">PULLER</p>
            <h1 class="section-title">FLASH STRIKER</h1>
            <p class="catalog-spec-lg">2m +</p>
            <p class="catalog-pack pdp-pack">YOUR PERFECT CATCHER</p>
            <p class="pdp-count">Catalogue image \${id} of 38</p>
            <div class="pdp-actions">
              <a class="btn btn-primary" href="/dealers#apply">Inquiry now <svg class="btn-icon" aria-hidden="true"><use href="#i-arrow"></use></svg></a>
            </div>
            <div class="pdp-pager">
          <a href="/products/flash-striker/\${product.prev}" rel="prev">Previous</a>
          <span class="pdp-count">\${id} / 38</span>
          <a href="/products/flash-striker/\${product.next}" rel="next">Next</a>
        </div>
          </div>
        </div>
      </div>
    </article>

    <section class="dealers" id="dealers" aria-labelledby="dealers-title">
      <div class="container dealers-inner reveal">
        <img class="dealers-logo" src="/images/logo.webp" alt="" width="640" height="320" loading="lazy" decoding="async" />
        <h2 id="dealers-title">Become a PULLER Authorized Dealer</h2>
        <p>PULLER works through a growing dealer network across all continents. Become an official dealer in your country or region and grow with a trusted fishing-products brand.</p>
        <a class="btn btn-outline-light" href="/dealers">
          Apply Now <svg class="btn-icon" aria-hidden="true"><use href="#i-arrow"></use></svg>
        </a>
      </div>
    </section>

  </main>\`;
}

export default async function Page({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: 'FLASH STRIKER',
        description: 'FLASH STRIKER. 2m +. YOUR PERFECT CATCHER.',
        image: \`https://pullertackle.com/images/products/flash-striker-160-dd-\${id}.webp\`,
        brand: { '@type': 'Brand', name: 'PULLER' },
        category: 'Hard Body Lures',
        url: \`https://pullertackle.com/products/flash-striker/\${id}\`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pullertackle.com/' },
          { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://pullertackle.com/#products' },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'FLASH STRIKER',
            item: 'https://pullertackle.com/products/flash-striker',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: \`FLASH STRIKER \${id}\`,
            item: \`https://pullertackle.com/products/flash-striker/\${id}\`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HtmlMain html={buildMain(id, product)} />
    </>
  );
}
`;

fs.writeFileSync(path.join(pdpDir, 'page.js'), pdpPage);
console.log('Wrote app/products/flash-striker/[id]/page.js');
console.log('Done.');
