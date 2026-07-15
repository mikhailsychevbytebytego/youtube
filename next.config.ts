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
    ],
  },
};

export default nextConfig;
