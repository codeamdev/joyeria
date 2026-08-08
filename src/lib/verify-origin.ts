import type { NextRequest } from "next/server";

// Defensa adicional contra CSRF en rutas API mutantes (más allá de la cookie
// de sesión SameSite=Lax de Auth.js): rechaza si el Origin del request no
// coincide con el host que sirve la app.
export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Muchos clientes no-navegador omiten Origin; para nuestras rutas (todas
    // llamadas por fetch() desde el propio sitio) exigimos que esté presente.
    return false;
  }
  try {
    const originHost = new URL(origin).host;
    return originHost === request.headers.get("host");
  } catch {
    return false;
  }
}
