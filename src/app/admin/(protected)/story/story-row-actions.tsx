"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/components/ui/alert-dialog";
import { StoryFormDialog } from "./story-form-dialog";
import { deleteStorySection } from "./actions";

export function StoryRowActions({
  section,
}: {
  section: { id: string; order: number; title: string; body: string; imageUrl: string | null; videoUrl: string | null };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
      <StoryFormDialog
        mode="edit"
        section={section}
        trigger={
          <button type="button" className="rounded p-1.5 text-ink/50 hover:bg-surface hover:text-ink" aria-label="Editar">
            <Pencil size={16} />
          </button>
        }
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button type="button" className="rounded p-1.5 text-ink/50 hover:bg-surface hover:text-red-700" aria-label="Eliminar">
            <Trash2 size={16} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent
          title={`Eliminar “${section.title}”`}
          confirmLabel={isPending ? "Eliminando…" : "Eliminar"}
          onConfirm={() => {
            startTransition(async () => {
              const result = await deleteStorySection(section.id);
              if (result.error) setError(result.error);
              else router.refresh();
            });
          }}
        />
      </AlertDialog>
    </div>
  );
}
