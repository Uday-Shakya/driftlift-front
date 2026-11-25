import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  turbopack: {},
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /react-toastify/ },
      { file: /react-toastify\.esm\.mjs\.map$/ },
    ];
    return config;
  },
};

export default nextConfig;
