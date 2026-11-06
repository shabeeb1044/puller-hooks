import { getDealerDirectory } from '@/lib/cms';
import { jsonOk } from '@/lib/api';

export async function GET() {
  const regions = await getDealerDirectory();
  return jsonOk({ regions });
}
