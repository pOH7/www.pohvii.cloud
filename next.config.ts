import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./content/blog/**/*"],
  },
  transpilePackages: ["next-mdx-remote"],
  trailingSlash: true,
};

export default nextConfig;
