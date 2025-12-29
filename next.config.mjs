/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable source maps in production for code coverage
  productionBrowserSourceMaps: true,
  webpack: (config) => {
    // Use source-map for all builds (dev and prod) for coverage and Docker compatibility
    config.devtool = 'source-map'
    return config
  },
};

export default nextConfig;