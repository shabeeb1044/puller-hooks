'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

const FORM_PATHS = new Set(['/', '/contact', '/dealers']);

export default function FormScripts() {
  const pathname = usePathname();
  if (!FORM_PATHS.has(pathname)) return null;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/libphonenumber-js@1.11.18/bundle/libphonenumber-max.js"
        strategy="afterInteractive"
      />
      <Script src="/js/countries.js" strategy="afterInteractive" />
      <Script src="/js/country-select.js" strategy="afterInteractive" />
      <Script src="/js/phone-input.js" strategy="afterInteractive" />
      <Script
        src="/js/forms.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.PullerForms) {
            window.PullerForms.init();
          }
        }}
      />
    </>
  );
}
