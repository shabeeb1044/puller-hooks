/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/dealers.html', destination: '/dealers', permanent: true },
      { source: '/our-story.html', destination: '/our-story', permanent: true },
      { source: '/products/hooks.html', destination: '/products/hooks', permanent: true },
      {
        source: '/products/hard-body-lures.html',
        destination: '/products/flash-striker',
        permanent: true,
      },
      {
        source: '/products/flash-striker.html',
        destination: '/products/flash-striker',
        permanent: true,
      },
      {
        source: '/products/flash-striker-:id(\\d{2}).html',
        destination: '/products/flash-striker/:id',
        permanent: true,
      },
      {
        source: '/products/flash-striker-160-dd',
        destination: '/products/flash-striker',
        permanent: true,
      },
      {
        source: '/products/flash-striker-160-dd.html',
        destination: '/products/flash-striker',
        permanent: true,
      },
      {
        source: '/products/flash-striker-160-dd/:id',
        destination: '/products/flash-striker/:id',
        permanent: true,
      },
      {
        source: '/products/flash-striker-160-dd-:id.html',
        destination: '/products/flash-striker/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
