export const viewport = {
  themeColor: '#f7ed22',
};

export const metadata = {
  metadataBase: new URL('https://pullertackle.com'),
  title: {
    default: 'Fishing Hooks, Lures & Jigs | PULLER Co., Ltd.',
    template: '%s',
  },
  description:
    'PULLER Co., Ltd. manufactures and exports fishing hooks, FLASH STRIKER hard-body lures, metal lures and fishing jigs for saltwater and freshwater commercial and sport fishing.',
  authors: [{ name: 'PULLER Co., Ltd.' }],
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/images/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    siteName: 'PULLER Co., Ltd.',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/barlow-condensed-800.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/barlow-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
