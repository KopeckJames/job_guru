/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only run this on the client side
    if (!isServer) {
      // Add fallbacks for node modules used by pdf-parse and mammoth
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        zlib: false,
        util: false,
        crypto: false,
        buffer: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
