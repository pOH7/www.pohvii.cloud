import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.3"],
  outputFileTracingIncludes: {
    "/*": ["./content/blog/**/*"],
  },
  transpilePackages: ["next-mdx-remote"],
  trailingSlash: true,
};

export default nextConfig;
