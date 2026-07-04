import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_SUPER_ADMIN_API || 'http://127.0.0.1:5002';
    // If apiBase already includes /api, don't add it again
    const destination = apiBase.includes('/api') ? apiBase : `${apiBase}/api`;
    return [
      {
        source: "/api/:path*",
        destination: `${destination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
