import type { NextConfig } from "next";

// Always-present hardening headers. Safe for both dev and prod.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// Production-only headers.
//
// - Content-Security-Policy: 'unsafe-inline' for script/style is required by
//   Next.js (inline serialized flight data + runtime bootstrap) and next/font
//   inline <style>. 'unsafe-eval' is NOT needed in production and is not
//   allowed. Images allow any https: source so admin-managed image URLs
//   (Unsplash, Google content, or custom) keep working.
// - Strict-Transport-Security: only meaningful over HTTPS.
const PROD_SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src https://instagram.com https://*.instagram.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://wa.me",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    const headers = process.env.NODE_ENV === 'production'
      ? [...SECURITY_HEADERS, ...PROD_SECURITY_HEADERS]
      : SECURITY_HEADERS;
    return [
      {
        source: '/:path*',
        headers,
      },
    ];
  },
};

export default nextConfig;
