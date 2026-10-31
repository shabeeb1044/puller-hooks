import { notFound } from 'next/navigation';
import { HtmlMain } from '@/components/HtmlMain';
import { prisma } from '@/lib/db';
import { getProduct, getAllIds } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return getAllIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dbProduct = await prisma.product.findFirst({
    where: { slug: id, status: 'published' },
  });
  const catalogProduct = getProduct(id);
  if (!dbProduct && !catalogProduct) return {};

  const title = `${dbProduct?.name || 'FLASH STRIKER'} — ${id} | PULLER Co., Ltd.`;
  const description =
    dbProduct?.description ||
    `PULLER FLASH STRIKER. 2m +. YOUR PERFECT CATCHER. Catalogue image ${id} of 38.`;
  const image =
    dbProduct?.image
      ? `https://pullertackle.com${dbProduct.image}`
      : `https://pullertackle.com/images/products/flash-striker-160-dd-${id}.webp`;
  const url = `https://pullertackle.com/products/flash-striker/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, alt: dbProduct?.imageAlt || 'FLASH STRIKER, 2m +' }],
      siteName: 'PULLER Co., Ltd.',
      locale: 'en_US',
      type: 'website',
    },
    alternates: { canonical: url },
  };
}

function buildMain({ id, name, image, height, prev, next, total, ctaHref, ctaLabel, tagline }) {
  return `<main id="main">
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
        <span aria-current="page">${id}</span>
      </nav>
        <div class="pdp-layout">
          <div class="pdp-media">
            <img src="${image}" alt="${name}, 2m +" width="1680" height="${height}" decoding="async" />
          </div>
          <div class="pdp-copy">
            <p class="section-eyebrow">PULLER</p>
            <h1 class="section-title">${name}</h1>
            <p class="catalog-spec-lg">2m +</p>
            <p class="catalog-pack pdp-pack">${tagline}</p>
            <p class="pdp-count">Catalogue image ${id} of ${total}</p>
            <div class="pdp-actions">
              <a class="btn btn-primary" href="${ctaHref}">${ctaLabel} <svg class="btn-icon" aria-hidden="true"><use href="#i-arrow"></use></svg></a>
            </div>
            <div class="pdp-pager">
          <a href="/products/flash-striker/${prev}" rel="prev">Previous</a>
          <span class="pdp-count">${id} / ${total}</span>
          <a href="/products/flash-striker/${next}" rel="next">Next</a>
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

  </main>`;
}

export default async function Page({ params }) {
  const { id } = await params;

  const siblings = await prisma.product.findMany({
    where: {
      status: 'published',
      subcategory: { slug: 'flash-striker' },
    },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, slug: true, name: true, image: true, imageHeight: true, ctaHref: true, ctaLabel: true, description: true },
  });

  const index = siblings.findIndex((p) => p.slug === id);
  const dbProduct = index >= 0 ? siblings[index] : null;
  const catalogProduct = getProduct(id);

  if (!dbProduct && !catalogProduct) notFound();

  const total = siblings.length || getAllIds().length;
  const prev =
    dbProduct && siblings.length
      ? siblings[(index - 1 + siblings.length) % siblings.length].slug
      : catalogProduct?.prev;
  const next =
    dbProduct && siblings.length
      ? siblings[(index + 1) % siblings.length].slug
      : catalogProduct?.next;

  const name = dbProduct?.name || 'FLASH STRIKER';
  const image = dbProduct?.image || `/images/products/flash-striker-160-dd-${id}.webp`;
  const height = dbProduct?.imageHeight || catalogProduct?.height || 526;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name,
        description: dbProduct?.description || 'FLASH STRIKER. 2m +. YOUR PERFECT CATCHER.',
        image: `https://pullertackle.com${image}`,
        brand: { '@type': 'Brand', name: 'PULLER' },
        category: 'Hard Body Lures',
        url: `https://pullertackle.com/products/flash-striker/${id}`,
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
            name: id,
            item: `https://pullertackle.com/products/flash-striker/${id}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HtmlMain
        html={buildMain({
          id,
          name,
          image,
          height,
          prev,
          next,
          total,
          ctaHref: dbProduct?.ctaHref || '/dealers#apply',
          ctaLabel: dbProduct?.ctaLabel || 'Inquiry now',
          tagline: 'YOUR PERFECT CATCHER',
        })}
      />
    </>
  );
}
