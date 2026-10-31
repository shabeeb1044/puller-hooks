import { notFound, redirect } from 'next/navigation';
import CategoryPage from '@/components/CategoryPage';
import { getPublishedProductsForListing } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const { category, subcategory } = await getPublishedProductsForListing(categorySlug, subcategorySlug);
  if (!category || !subcategory) return { title: 'Products | PULLER' };
  return {
    title: `${subcategory.name} | PULLER Co., Ltd.`,
    description: subcategory.description || subcategory.pageLead || `${subcategory.name} from PULLER.`,
  };
}

export default async function DynamicSubcategoryPage({ params }) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  if (categorySlug === 'hard-body-lures' && subcategorySlug === 'flash-striker') {
    redirect('/products/flash-striker');
  }

  const { category, subcategory, products } = await getPublishedProductsForListing(
    categorySlug,
    subcategorySlug
  );
  if (!category || !subcategory) notFound();

  return (
    <CategoryPage
      category={category}
      subcategory={subcategory}
      products={products}
      bannerVariant={subcategory.slug === 'flash-striker' ? 'yellow' : 'default'}
    />
  );
}
