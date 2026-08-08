"use client";

import { useState } from "react";
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
import Image from "next/image";
import { GripVertical, Star, Trash2, UploadCloud } from "lucide-react";

export type ImageItem = {
  id: string;
  url: string;
  order: number;
  isMain: boolean;
  altText: string;
};

export function ProductImageManager({
  value,
  onChange,
}: {
  value: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function withMainFallback(images: ImageItem[]) {
    if (images.length > 0 && !images.some((img) => img.isMain)) {
      return images.map((img, index) => ({ ...img, isMain: index === 0 }));
    }
    return images;
  }

  async function handleFiles(files: FileList) {
    setError(null);
    setIsUploading(true);
    try {
      const uploaded: ImageItem[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "image");
        formData.append("subdir", "products");
        const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Error al subir una imagen");
          continue;
        }
        uploaded.push({ id: crypto.randomUUID(), url: json.url, order: 0, isMain: false, altText: "" });
      }
      const merged = withMainFallback(
        [...value, ...uploaded].map((img, index) => ({ ...img, order: index })),
      );
      onChange(merged);
    } finally {
      setIsUploading(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((img) => img.id === active.id);
    const newIndex = value.findIndex((img) => img.id === over.id);
    onChange(arrayMove(value, oldIndex, newIndex).map((img, index) => ({ ...img, order: index })));
  }

  function setMain(id: string) {
    onChange(value.map((img) => ({ ...img, isMain: img.id === id })));
  }

  function updateAlt(id: string, altText: string) {
    onChange(value.map((img) => (img.id === id ? { ...img, altText } : img)));
  }

  function remove(id: string) {
    const filtered = withMainFallback(
      value.filter((img) => img.id !== id).map((img, index) => ({ ...img, order: index })),
    );
    onChange(filtered);
  }

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {value.map((image) => (
                <SortableImageItem
                  key={image.id}
                  image={image}
                  onSetMain={() => setMain(image.id)}
                  onRemove={() => remove(image.id)}
                  onAltChange={(alt) => updateAlt(image.id, alt)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ink/25 py-4 text-sm text-ink/60 hover:bg-surface">
        <UploadCloud size={18} />
        {isUploading ? "Subiendo…" : "Agregar imágenes (arrastra para reordenar)"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          disabled={isUploading}
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              void handleFiles(event.target.files);
            }
            event.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

function SortableImageItem({
  image,
  onSetMain,
  onRemove,
  onAltChange,
}: {
  image: ImageItem;
  onSetMain: () => void;
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
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-md border border-ink/10 bg-white"
    >
      <div className="relative aspect-square">
        <Image src={image.url} alt={image.altText || ""} fill sizes="150px" className="object-cover" />
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1 cursor-grab rounded bg-white/85 p-1 text-ink/60 active:cursor-grabbing"
          aria-label="Reordenar imagen"
        >
          <GripVertical size={14} />
        </button>
        <button
          type="button"
          onClick={onSetMain}
          className={`absolute right-1 top-1 rounded p-1 ${image.isMain ? "bg-gold text-white" : "bg-white/85 text-ink/50"}`}
          aria-label="Marcar como imagen principal"
          title="Imagen principal"
        >
          <Star size={14} fill={image.isMain ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="absolute bottom-1 right-1 rounded bg-white/85 p-1 text-red-700"
          aria-label="Eliminar imagen"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Texto alternativo"
        defaultValue={image.altText}
        onBlur={(event) => onAltChange(event.target.value)}
        className="w-full border-t border-ink/10 px-2 py-1 text-xs outline-none"
      />
    </div>
  );
}
