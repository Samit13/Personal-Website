/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // update domains if using external images
    remotePatterns: []
  },
  experimental: {
    typedRoutes: true
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|frag|vert)$/i,
      type: 'asset/source'
    })
    return config
  }
};

export default nextConfig;
