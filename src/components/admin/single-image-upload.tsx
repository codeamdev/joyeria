"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";

type Subdir = "categories" | "hero" | "story";

export function SingleImageUpload({
  name,
  subdir,
  defaultUrl,
}: {
  name: string;
  subdir: Subdir;
  defaultUrl?: string | null;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "image");
      formData.append("subdir", subdir);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir la imagen");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("Error de red al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-md border border-ink/10 bg-surface">
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-ink/20 text-ink/30">
            <UploadCloud size={20} />
          </div>
        )}
        <label className="cursor-pointer rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-surface">
          {isUploading ? "Subiendo…" : url ? "Cambiar imagen" : "Subir imagen"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
