"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "./category-form-dialog";
import { deleteCategory } from "./actions";

type CategoryOption = { id: string; name: string };

export function CategoryRowActions({
  category,
  parentOptions,
}: {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    order: number;
    parentId: string | null;
  };
  parentOptions: CategoryOption[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
      <CategoryFormDialog
        mode="edit"
        category={category}
        parentOptions={parentOptions}
        trigger={
          <button
            type="button"
            className="rounded p-1.5 text-ink/50 hover:bg-surface hover:text-ink"
            aria-label={`Editar ${category.name}`}
          >
            <Pencil size={16} />
          </button>
        }
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="rounded p-1.5 text-ink/50 hover:bg-surface hover:text-red-700"
            aria-label={`Eliminar ${category.name}`}
          >
            <Trash2 size={16} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent
          title={`Eliminar “${category.name}”`}
          description="Esta acción no se puede deshacer. No se podrá eliminar si tiene productos o subcategorías asociadas."
          confirmLabel={isPending ? "Eliminando…" : "Eliminar"}
          onConfirm={() => {
            startTransition(async () => {
              const result = await deleteCategory(category.id);
              if (result.error) setError(result.error);
            });
          }}
        />
      </AlertDialog>
    </div>
  );
}
