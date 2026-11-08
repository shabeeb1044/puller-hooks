import Icons from '@/components/Icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SiteInteractions from '@/components/SiteInteractions';
import FormScripts from '@/components/FormScripts';
import { getNavCategories } from '@/lib/cms';
import { getSocialLinks } from '@/lib/socialLinksStore';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const [categories, socialLinks] = await Promise.all([
    getNavCategories(),
    getSocialLinks(),
  ]);

  return (
    <>
      <link rel="stylesheet" href="/css/style.css?v=20261109-nav-label" />
      <link rel="stylesheet" href="/css/flag-icons.min.css" />
      <link rel="stylesheet" href="/css/forms.css" />
      <Icons />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header categories={categories} />
      {children}
      <Footer socialLinks={socialLinks} />
      <SiteInteractions socialLinks={socialLinks} />
      <FormScripts />
    </>
  );
}
