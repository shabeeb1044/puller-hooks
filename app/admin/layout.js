import './admin.css';
import AdminShell from '@/components/admin/AdminShell';
import { getEnv } from '@/lib/env';

export const metadata = {
  title: 'Admin | PULLER',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const googleSheetUrl =
    (await getEnv('GOOGLE_SHEET_URL')) || (await getEnv('GOOGLE_SHEET')) || '';

  return <AdminShell googleSheetUrl={googleSheetUrl}>{children}</AdminShell>;
}
