import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // transformers.js ships native ONNX bindings that must not be bundled.
  serverExternalPackages: ["@huggingface/transformers"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "videodelivery.net",
      },
    ],
  },
};

export default nextConfig;
