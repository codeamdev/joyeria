import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Hay que declarar explícitamente que el sitio se sirve sobre HTTPS real
// (dominio + certificado). Sin esto, "upgrade-insecure-requests" y HSTS
// rompen un despliegue temporal en HTTP plano: el navegador intenta
// recargar CSS/JS/fuentes por https:// contra un puerto que no habla TLS,
// esas peticiones fallan y la página carga sin ningún estilo.
const isHttpsDeployment = process.env.FORCE_HTTPS === "true";

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
  ${isHttpsDeployment ? "upgrade-insecure-requests;" : ""}
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Solo tiene sentido anunciar HSTS cuando el sitio realmente sirve HTTPS;
  // enviarlo sobre HTTP plano no rompe nada por sí solo (los navegadores lo
  // ignoran ahí), pero lo condicionamos igual para que la señal sea honesta.
  ...(isHttpsDeployment
    ? [{ key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" }]
    : []),
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
