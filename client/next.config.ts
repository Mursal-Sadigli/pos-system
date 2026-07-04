import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // SUPER_ADMIN_API_URL - server-side (Vercel-də Environment Variables bölməsindən set edilir)
    // NEXT_PUBLIC_SUPER_ADMIN_API - fallback (köhnə dəyişən üçün)
    const apiBase =
      process.env.SUPER_ADMIN_API_URL ||
      process.env.NEXT_PUBLIC_SUPER_ADMIN_API ||
      'http://127.0.0.1:5002';

    // apiBase artıq /api ehtiva edirsə, yenidən əlavə etmə
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
