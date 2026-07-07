import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // SUPER_ADMIN_API_URL - server-side (Vercel Environment Variables-dan)
    // NEXT_PUBLIC_SUPER_ADMIN_API - köhnə dəstək üçün
    // Default: Render-dəki backend URL
    const apiBase =
      process.env.SUPER_ADMIN_API_URL ||
      process.env.NEXT_PUBLIC_SUPER_ADMIN_API ||
      'http://localhost:5000';

    // apiBase artıq /api ilə bitmirsə, /api əlavə et
    const destination = apiBase.endsWith('/api')
      ? apiBase
      : apiBase.replace(/\/$/, '') + '/api';

    return [
      {
        source: "/api/:path*",
        destination: `${destination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
