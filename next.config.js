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
}

module.exports = nextConfig
