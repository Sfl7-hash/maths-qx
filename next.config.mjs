/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mathjs'],
  },
  webpack: (config) => {
    // Handle three.js and WebGL
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
