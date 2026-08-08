import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fileTypeFromBlob } from "file-type";

const rawUploadsDir = process.env.UPLOADS_DIR;
if (!rawUploadsDir) {
  throw new Error("UPLOADS_DIR no está configurado en las variables de entorno");
}
const UPLOADS_DIR: string = rawUploadsDir;

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

// video/quicktime (.mov) es común en cámaras/teléfonos usados para el taller.
const ALLOWED_VIDEO_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 300 * 1024 * 1024;

export class UploadValidationError extends Error {}

export type UploadSubdir = "products" | "categories" | "hero" | "custom-orders" | "story";

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

/**
 * Recibe un archivo de imagen ya validado por MIME real (magic bytes) y lo
 * recomprime a WebP con sharp. Esto reescribe por completo los bytes del
 * archivo servido — nunca se guarda el original — eliminando EXIF/metadatos
 * y cualquier payload no-imagen embebido en el archivo subido.
 */
export async function saveUploadedImage(file: File, subdir: UploadSubdir) {
  if (file.size === 0) throw new UploadValidationError("El archivo está vacío");
  if (file.size > MAX_IMAGE_BYTES) {
    throw new UploadValidationError(
      `La imagen supera el máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`,
    );
  }

  const detected = await fileTypeFromBlob(file);
  if (!detected || !ALLOWED_IMAGE_MIME.has(detected.mime)) {
    throw new UploadValidationError("El archivo no es una imagen JPEG/PNG/WebP/AVIF válida");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let processed: Buffer;
  try {
    processed = await sharp(buffer, { failOn: "error" })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new UploadValidationError("No se pudo procesar la imagen (archivo corrupto o inválido)");
  }

  const filename = `${randomUUID()}.webp`;
  const dir = path.join(UPLOADS_DIR, subdir);
  await ensureDir(dir);
  await writeFile(path.join(dir, filename), processed);

  const meta = await sharp(processed).metadata();

  return {
    url: `/media/${subdir}/${filename}`,
    width: meta.width ?? null,
    height: meta.height ?? null,
  };
}

/**
 * Los videos NO se reprocesan (no hay dependencia de ffmpeg en este proyecto):
 * se valida tipo MIME real y tamaño, y se guarda con nombre reescrito. A
 * diferencia de las imágenes, esto no elimina metadatos embebidos del video
 * original — limitación conocida, aceptable porque solo lo sube el admin
 * autenticado, nunca un visitante público.
 */
export async function saveUploadedVideo(file: File, subdir: UploadSubdir) {
  if (file.size === 0) throw new UploadValidationError("El archivo está vacío");
  if (file.size > MAX_VIDEO_BYTES) {
    throw new UploadValidationError(
      `El video supera el máximo de ${MAX_VIDEO_BYTES / (1024 * 1024)}MB`,
    );
  }

  const detected = await fileTypeFromBlob(file);
  const extension = detected ? ALLOWED_VIDEO_MIME[detected.mime] : undefined;
  if (!detected || !extension) {
    throw new UploadValidationError("El archivo no es un video MP4/WebM/MOV válido");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${extension}`;
  const dir = path.join(UPLOADS_DIR, subdir);
  await ensureDir(dir);
  await writeFile(path.join(dir, filename), buffer);

  return { url: `/media/${subdir}/${filename}` };
}
