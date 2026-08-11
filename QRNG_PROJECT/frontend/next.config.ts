import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  },
  {
    key: "Content-Security-Policy",
    value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' ${apiUrl} http://127.0.0.1:8000 http://localhost:8000 http://localhost:3000 https:; worker-src 'self' blob:; frame-ancestors 'none';`
  }
];

const nextConfig: NextConfig = {
  // "export" generates a pure static site (HTML/CSS/JS) — correct for Cloudflare Pages.
  // All routes in this project are ○ Static, so no Node.js server is needed.
  output: "export",
  // Disable Next.js image optimisation (requires a Node server; not available in static export).
  // Images are served as-is via Cloudflare's edge CDN.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  },
  experimental: {
    optimizePackageImports: [
      "recharts",
      "lucide-react",
      "framer-motion",
      "@react-three/fiber",
      "@react-three/drei"
    ]
  }
};

export default nextConfig;
