import type { NextConfig } from 'next';

// In production this must point at the deployed API's real origin (e.g.
// https://api.sfhacks.io) via API_ORIGIN — the localhost fallback only
// works for local dev, and silently 404s/fails against a deployed frontend.
const apiOrigin = process.env.API_ORIGIN || `http://127.0.0.1:${process.env.BACKEND_PORT}`;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/trpc/:path*',
        destination: `${apiOrigin}/trpc/:path*`
      }
    ];
  }
};

export default nextConfig;
