import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.*.amazonaws.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin/products",
        destination: "/admin/productos",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/admin/productos",
        destination: "/admin/products",
      },
    ];
  },
};

export default nextConfig;
