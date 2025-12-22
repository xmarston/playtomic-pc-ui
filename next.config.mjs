/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Use source-map instead of eval-based source maps for Docker compatibility
      config.devtool = 'source-map'
    }
    return config
  },
};

export default nextConfig;