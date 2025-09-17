/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14+ has app directory enabled by default
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Skip API routes during static export
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true
}

module.exports = nextConfig
