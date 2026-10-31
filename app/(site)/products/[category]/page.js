import { notFound, redirect } from 'next/navigation';
import CategoryPage from '@/components/CategoryPage';
import { getPublishedProductsForListing } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const { category } = await getPublishedProductsForListing(slug);
  if (!category) return { title: 'Products | PULLER' };
  return {
    title: `${category.name} | PULLER Co., Ltd.`,
    description: category.description || category.pageLead || `${category.name} from PULLER.`,
  };
}

export default async function DynamicCategoryPage({ params }) {
  const { category: slug } = await params;

  // Dedicated routes own these slugs
  if (slug === 'flash-striker') redirect('/products/flash-striker');
  if (slug === 'hooks') redirect('/products/hooks');

  const { category, products } = await getPublishedProductsForListing(slug);
  if (!category) notFound();

  // Hard body lures with flash-striker subcategory: send users to legacy URL when only that sub exists
  if (slug === 'hard-body-lures') {
    const flash = category.subcategories?.find((s) => s.slug === 'flash-striker');
    if (flash && category.subcategories.length === 1) {
      redirect('/products/flash-striker');
    }
  }

  return <CategoryPage category={category} products={products} />;
}
