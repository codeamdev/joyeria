"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/components/ui/alert-dialog";
import { deleteProduct } from "./actions";

export function ProductRowActions({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
      <Link
        href={`/admin/products/${productId}`}
        className="rounded p-1.5 text-ink/50 hover:bg-surface hover:text-ink"
        aria-label={`Editar ${productName}`}
      >
        <Pencil size={16} />
      </Link>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="rounded p-1.5 text-ink/50 hover:bg-surface hover:text-red-700"
            aria-label={`Eliminar ${productName}`}
          >
            <Trash2 size={16} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent
          title={`Eliminar “${productName}”`}
          description="Esta acción no se puede deshacer."
          confirmLabel={isPending ? "Eliminando…" : "Eliminar"}
          onConfirm={() => {
            startTransition(async () => {
              const result = await deleteProduct(productId);
              if (result.error) setError(result.error);
              else router.refresh();
            });
          }}
        />
      </AlertDialog>
    </div>
  );
}
