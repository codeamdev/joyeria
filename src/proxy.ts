import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renombró `middleware.ts` a `proxy.ts` (mismo mecanismo, corre en
// runtime Node.js). Esta es la capa de red que bloquea /admin/* sin sesión;
// la autorización por rol se revalida además en cada layout y Server Action,
// porque un cambio de matcher aquí no debe ser el único punto de falla.
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
