import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@beatvision/audio-engine",
    "@beatvision/visual-engine",
    "@beatvision/validation",
    "@beatvision/ui",
  ],
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  // Webpack config for Three.js and FFmpeg
  webpack: (config, { isServer }) => {
    // Handle Three.js
    config.externals = [...(config.externals || [])];
    
    // Handle FFmpeg.wasm
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
