import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Apagamos la PWA en dev para que no moleste el caché
  register: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  allowedDevOrigins: ['localhost','192.168.1.90'],
  turbopack: {},
};

export default withPWA(nextConfig);
