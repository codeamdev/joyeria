import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Sin nonces: exige 'unsafe-inline' en script-src para los bootstrap scripts
// que Next.js App Router inyecta (payload de RSC). La alternativa (nonces vía
// proxy.ts) fuerza renderizado dinámico en TODAS las páginas — inaceptable
// para un catálogo mayormente estático que debe cargar rápido en móvil.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  media-src 'self';
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // HSTS solo tiene efecto sobre HTTPS; el navegador lo ignora en HTTP plano
  // durante desarrollo local. Sin "preload": es una decisión de negocio aparte.
  { key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
