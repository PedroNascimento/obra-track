import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Necessário para @react-pdf/renderer (usa APIs de browser no lado servidor)
  serverExternalPackages: ["@react-pdf/renderer"],

  // Otimização de imagens
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
