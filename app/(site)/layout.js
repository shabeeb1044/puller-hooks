import Icons from '@/components/Icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SiteInteractions from '@/components/SiteInteractions';
import FormScripts from '@/components/FormScripts';
import { getNavCategories } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const categories = await getNavCategories();

  return (
    <>
      <link rel="stylesheet" href="/css/style.min.css" />
      <link rel="stylesheet" href="/css/flag-icons.min.css" />
      <link rel="stylesheet" href="/css/forms.css" />
      <Icons />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header categories={categories} />
      {children}
      <Footer />
      <SiteInteractions />
      <FormScripts />
    </>
  );
}
