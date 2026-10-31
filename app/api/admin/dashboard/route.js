import { prisma } from '@/lib/db';
import { withAdmin, jsonOk } from '@/lib/api';

export async function GET() {
  return withAdmin(async () => {
    const [
      products,
      categories,
      subcategories,
      dealerNew,
      contactNew,
      dealerTotal,
      contactTotal,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.subcategory.count(),
      prisma.dealerInquiry.count({ where: { status: 'new' } }),
      prisma.contactInquiry.count({ where: { status: 'new' } }),
      prisma.dealerInquiry.count(),
      prisma.contactInquiry.count(),
    ]);

    return jsonOk({
      products,
      categories,
      subcategories,
      dealerNew,
      contactNew,
      dealerTotal,
      contactTotal,
      publishedProducts: await prisma.product.count({ where: { status: 'published' } }),
      draftProducts: await prisma.product.count({ where: { status: 'draft' } }),
    });
  });
}
