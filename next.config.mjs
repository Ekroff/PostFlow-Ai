/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
  },
  // Allow build to succeed even without all env vars during CI
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
