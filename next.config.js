/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com', // This works for subdomains
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Add this for picsum.photos
        pathname: '/**',
      },
    ],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

module.exports = nextConfig;