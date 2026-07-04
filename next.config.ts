import type { NextConfig } from "next";

const isWasmOnly = process.env.FORCE_WASM === "true";

const nextConfig: NextConfig = {
  transpilePackages: ["@xenova/transformers"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/onnxruntime-node/bin/**/*"],
  },
  turbopack: {
    root: __dirname,
    resolveAlias: isWasmOnly ? {
      "onnxruntime-node": "onnxruntime-web",
    } : undefined,
  },
  serverExternalPackages: isWasmOnly ? ["sharp"] : ["sharp", "onnxruntime-node"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      ...(isWasmOnly ? {
        "onnxruntime-node$": "onnxruntime-web",
      } : {
        "onnxruntime-node$": false,
      }),
    };
    return config;
  },
};

export default nextConfig;
