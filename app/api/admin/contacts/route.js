import { prisma } from '@/lib/db';
import { withAdmin, jsonOk } from '@/lib/api';

export async function GET(request) {
  return withAdmin(async () => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const status = searchParams.get('status') || '';
    const where = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { company: { contains: q } },
        { topic: { contains: q } },
        { phone: { contains: q } },
        { whatsapp: { contains: q } },
        { message: { contains: q } },
      ];
    }
    const inquiries = await prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return jsonOk({ inquiries });
  });
}
