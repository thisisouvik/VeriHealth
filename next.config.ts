import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@scure/base', '@noble/curves', '@noble/hashes'],
  webpack: (config) => {
    config.externals.push('@scure/base', '@prisma/adapter-pg', 'pg', 'pg-pool');
    return config;
  },
};

export default nextConfig;