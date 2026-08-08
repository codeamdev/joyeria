"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/components/ui/alert-dialog";
import {
  addHeroImages,
  removeHeroImage,
  removeHeroVideo,
  reorderHeroImages,
  setHeroVideo,
  updateHeroImageAlt,
} from "./actions";

type HeroImageItem = { id: string; url: string; altText: string };

export function HeroManager({
  videoUrl,
  images: initialImages,
}: {
  videoUrl: string | null;
  images: HeroImageItem[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleVideoUpload(file: File) {
    setError(null);
    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "video");
      formData.append("subdir", "hero");
      const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Error al subir el video");
        return;
      }
      await setHeroVideo(json.url);
      router.refresh();
    } finally {
      setIsUploadingVideo(false);
    }
  }

  async function handleImagesUpload(files: FileList) {
    setError(null);
    setIsUploadingImages(true);
    try {
      const uploaded: Array<{ url: string; altText?: string }> = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "image");
        formData.append("subdir", "hero");
        const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Error al subir una imagen");
          continue;
        }
        uploaded.push({ url: json.url });
      }
      if (uploaded.length > 0) {
        await addHeroImages(uploaded);
        router.refresh();
      }
    } finally {
      setIsUploadingImages(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);
    setImages(reordered);
    startTransition(async () => {
      await reorderHeroImages(reordered.map((img) => img.id));
    });
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-lg text-ink">Video</h2>
        {videoUrl ? (
          <div className="mt-3 space-y-3">
            <video src={videoUrl} controls className="w-full max-w-md rounded-md border border-ink/10" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="danger">Eliminar video</Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                title="Eliminar video del hero"
                description="Se volverá a mostrar el carrusel de imágenes (si hay alguna configurada)."
                confirmLabel="Eliminar"
                onConfirm={() => {
                  startTransition(async () => {
                    await removeHeroVideo();
                    router.refresh();
                  });
                }}
              />
            </AlertDialog>
          </div>
        ) : (
          <label className="mt-3 flex w-full max-w-md cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ink/25 py-6 text-sm text-ink/60 hover:bg-surface">
            <UploadCloud size={18} />
            {isUploadingVideo ? "Subiendo…" : "Subir video (reemplaza el carrusel)"}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              disabled={isUploadingVideo}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleVideoUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg text-ink">Carrusel de imágenes</h2>
        <p className="mt-1 text-xs text-ink/50">
          Solo se muestra en el sitio cuando no hay video cargado.
        </p>

        {images.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((image) => (
                  <SortableHeroImage
                    key={image.id}
                    image={image}
                    onRemove={() => {
                      setImages((prev) => prev.filter((img) => img.id !== image.id));
                      startTransition(async () => {
                        await removeHeroImage(image.id);
                      });
                    }}
                    onAltChange={(alt) => {
                      setImages((prev) =>
                        prev.map((img) => (img.id === image.id ? { ...img, altText: alt } : img)),
                      );
                      startTransition(async () => {
                        await updateHeroImageAlt(image.id, alt);
                      });
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : null}

        <label className="mt-3 flex w-full max-w-md cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ink/25 py-4 text-sm text-ink/60 hover:bg-surface">
          <UploadCloud size={18} />
          {isUploadingImages ? "Subiendo…" : "Agregar imágenes al carrusel"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            disabled={isUploadingImages}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) void handleImagesUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

function SortableHeroImage({
  image,
  onRemove,
  onAltChange,
}: {
  image: HeroImageItem;
  onRemove: () => void;
  onAltChange: (alt: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="overflow-hidden rounded-md border border-ink/10 bg-white">
      <div className="relative aspect-video">
        <Image src={image.url} alt={image.altText || ""} fill sizes="200px" className="object-cover" />
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1 cursor-grab rounded bg-white/85 p-1 text-ink/60 active:cursor-grabbing"
          aria-label="Reordenar"
        >
          <GripVertical size={14} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1 top-1 rounded bg-white/85 p-1 text-red-700"
          aria-label="Eliminar imagen"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Texto alternativo"
        defaultValue={image.altText}
        onBlur={(e) => onAltChange(e.target.value)}
        className="w-full border-t border-ink/10 px-2 py-1 text-xs outline-none"
      />
    </div>
  );
}
