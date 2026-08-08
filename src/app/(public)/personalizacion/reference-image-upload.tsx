"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";

export function ReferenceImageUpload({ name }: { name: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/public/custom-order-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la imagen");
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
      {url ? (
        <div className="relative h-24 w-24 overflow-hidden rounded-md border border-ink/10">
          <Image src={url} alt="Referencia" fill sizes="96px" className="object-cover" />
        </div>
      ) : null}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-surface">
        <UploadCloud size={14} />
        {isUploading ? "Subiendo…" : url ? "Cambiar imagen" : "Adjuntar imagen de referencia (opcional)"}
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
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
