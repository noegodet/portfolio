import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Page 404 unique pour tout le site (src/app/global-not-found.tsx).
  experimental: { globalNotFound: true },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
