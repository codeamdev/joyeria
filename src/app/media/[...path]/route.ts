import { NextResponse, type NextRequest } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

const UPLOADS_DIR = process.env.UPLOADS_DIR;

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

// Los archivos siempre se escriben con nombre generado por randomUUID(), así
// que este patrón estricto ya basta para descartar cualquier intento de path
// traversal; el chequeo de resolvedPath de abajo es una segunda capa.
const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!UPLOADS_DIR) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { path: segments } = await params;

  if (segments.length === 0 || !segments.every((segment) => SAFE_SEGMENT.test(segment))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const uploadsRoot = path.resolve(UPLOADS_DIR);
  const resolvedPath = path.resolve(uploadsRoot, ...segments);

  if (!resolvedPath.startsWith(uploadsRoot + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = path.extname(resolvedPath).slice(1).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXTENSION[extension];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  let fileSize: number;
  try {
    const fileStat = await stat(resolvedPath);
    if (!fileStat.isFile()) throw new Error("not a file");
    fileSize = fileStat.size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const baseHeaders = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };

  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match) {
      const start = match[1] ? Number.parseInt(match[1], 10) : 0;
      const end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const stream = createReadStream(resolvedPath, { start, end });
      return new NextResponse(Readable.toWeb(stream) as unknown as ReadableStream, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Length": String(end - start + 1),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        },
      });
    }
  }

  const stream = createReadStream(resolvedPath);
  return new NextResponse(Readable.toWeb(stream) as unknown as ReadableStream, {
    headers: { ...baseHeaders, "Content-Length": String(fileSize) },
  });
}
