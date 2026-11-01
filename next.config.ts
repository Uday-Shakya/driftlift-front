import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /react-toastify/ },
      { file: /react-toastify\.esm\.mjs\.map$/ },
    ];
    return config;
  },
};

export default nextConfig;
