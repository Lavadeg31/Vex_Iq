/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(mp3|wav)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name][ext]'
      }
    })
    return config
  },
  // Enable Vercel Speed Insights
  speedInsights: {
    enabled: true,
  },
  // Enable Vercel Analytics
  analytics: {
    enabled: true,
  }
}

module.exports = nextConfig 
