/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Imagens de produto vêm do bucket público do Cloudflare R2 (domínio variável
    // conforme o bucket configurado) ou de /public em desenvolvimento local.
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
