import { NextResponse, type NextRequest } from "next/server";
import { saveUploadedImage, UploadValidationError } from "@/lib/uploads";
import { checkRateLimit, customOrderRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { isSameOriginRequest } from "@/lib/verify-origin";

// Endpoint público (sin sesión) usado por el formulario de "Piezas
// personalizadas" para adjuntar una imagen de referencia. Fuertemente
// limitado en tasa y tamaño: es la única subida de archivos accesible sin
// autenticación en todo el sitio.
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const ip = getClientIp(request.headers) ?? "unknown";
  const rateLimit = await checkRateLimit(customOrderRateLimiter, ip);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes, intenta más tarde" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    }

    const result = await saveUploadedImage(file, "custom-orders");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("Error subiendo imagen de referencia", error);
    return NextResponse.json({ error: "Error subiendo el archivo" }, { status: 500 });
  }
}
