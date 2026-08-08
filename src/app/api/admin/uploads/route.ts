import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireActionRole, requireActionSession, ForbiddenError } from "@/lib/admin-auth";
import { saveUploadedImage, saveUploadedVideo, UploadValidationError } from "@/lib/uploads";
import { isSameOriginRequest } from "@/lib/verify-origin";

const fieldsSchema = z.object({
  kind: z.enum(["image", "video"]),
  subdir: z.enum(["products", "categories", "hero", "story"]),
});

// hero y story son contenido de marca ("configuración general"): solo ADMIN.
const ADMIN_ONLY_SUBDIRS = new Set(["hero", "story"]);

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const parsed = fieldsSchema.safeParse({
      kind: formData.get("kind"),
      subdir: formData.get("subdir"),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }
    const { kind, subdir } = parsed.data;

    if (ADMIN_ONLY_SUBDIRS.has(subdir)) {
      await requireActionRole("ADMIN");
    } else {
      await requireActionSession();
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    }

    if (kind === "image") {
      const result = await saveUploadedImage(file, subdir);
      return NextResponse.json(result);
    }

    if (subdir !== "hero" && subdir !== "story") {
      return NextResponse.json(
        { error: "Este apartado no admite video" },
        { status: 400 },
      );
    }
    const result = await saveUploadedVideo(file, subdir);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("Error subiendo archivo", error);
    return NextResponse.json({ error: "Error subiendo el archivo" }, { status: 500 });
  }
}
