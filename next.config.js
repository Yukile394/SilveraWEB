/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/((?!maintenance.html|logo.png|banner.png|favicon.ico).*)',
        destination: '/maintenance.html',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/maintenance.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
