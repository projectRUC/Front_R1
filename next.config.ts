import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://back-r1-rt7r.onrender.com";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['localhost', '192.168.1.90'],
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
