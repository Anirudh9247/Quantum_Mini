import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "export" generates a pure static site (HTML/CSS/JS) for Cloudflare Pages.
  // All routes in this project are ○ Static, so no Node.js server is needed.
  output: "export",
  // Image optimisation requires a Node server — disabled for static export.
  // Cloudflare Pages CDN serves images at the edge with no extra config.
  images: { unoptimized: true },
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
