import CategoryPage from '@/components/CategoryPage';
import { getPublishedProductsForListing } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'PULLER Hooks | Fishing Hooks for Saltwater & Freshwater',
  description:
    'PULLER fishing hooks for saltwater and freshwater. Round bend, in-line, octopus, Limerick and Kirby bend hooks for commercial and sport fishing.',
  openGraph: {
    title: 'PULLER Hooks | Fishing Hooks for Saltwater & Freshwater',
    description:
      'PULLER fishing hooks for saltwater and freshwater. Round bend, in-line, octopus, Limerick and Kirby bend hooks for commercial and sport fishing.',
    images: [{ url: 'https://pullertackle.com/images/product-hooks.webp' }],
    siteName: 'PULLER Co., Ltd.',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://pullertackle.com/products/hooks',
  },
};

export default async function HooksPage() {
  const { category, products } = await getPublishedProductsForListing('hooks');

  if (!category) {
    return (
      <main id="main">
        <div className="container" style={{ padding: '3rem 1rem' }}>
          <h1>Hooks</h1>
          <p>This category is not available yet. Configure it in the admin panel.</p>
        </div>
      </main>
    );
  }

  return <CategoryPage category={category} products={products} />;
}
