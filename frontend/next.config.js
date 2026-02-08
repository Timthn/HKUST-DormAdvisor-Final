/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['encrypted-tbn0.gstatic.com', 'storage.googleapis.com'],
  },
}

module.exports = nextConfig
