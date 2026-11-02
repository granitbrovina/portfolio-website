import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf ships its own font/layout engine; keep it out of the server bundle.
  serverExternalPackages: ["@react-pdf/renderer"],
  // pdfkit reads its built-in font files (Helvetica etc.) from disk at runtime,
  // which file tracing can't see. Ship them with the resume route explicitly.
  outputFileTracingIncludes: {
    "/api/resume": [
      "./node_modules/pdfkit/js/standard-fonts/**/*",
      "./node_modules/@react-pdf/pdfkit/**/*",
      "./node_modules/@react-pdf/font/**/*",
    ],
  },
  // Browsers ask for /favicon.ico on their own; answer with the configurable icon.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/api/favicon" }];
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
