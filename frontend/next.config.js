/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-markdown', 'remark-gfm'],
  images: {
    domains: ['encrypted-tbn0.gstatic.com', 'storage.googleapis.com'],
  },
}

module.exports = nextConfig
