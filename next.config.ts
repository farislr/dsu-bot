import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
};

export default nextConfig;
