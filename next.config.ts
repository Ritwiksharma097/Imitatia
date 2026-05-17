import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // required for static export
  },
  trailingSlash: true, // friendlier for Cloudflare Pages routing
  // Permanent redirects from common WordPress URLs are handled via _redirects at build.
};

export default nextConfig;
