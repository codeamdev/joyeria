"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

export function SingleVideoUpload({
  name,
  subdir,
  defaultUrl,
}: {
  name: string;
  subdir: "hero" | "story";
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
      formData.append("kind", "video");
      formData.append("subdir", subdir);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir el video");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("Error de red al subir el video");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      {url ? <video src={url} controls className="w-full max-w-xs rounded-md border border-ink/10" /> : null}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-surface">
        <UploadCloud size={14} />
        {isUploading ? "Subiendo…" : url ? "Cambiar video" : "Subir video"}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          disabled={isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </label>
      {url ? (
        <button
          type="button"
          onClick={() => setUrl("")}
          className="ml-2 text-xs text-red-700 hover:underline"
        >
          Quitar video
        </button>
      ) : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
