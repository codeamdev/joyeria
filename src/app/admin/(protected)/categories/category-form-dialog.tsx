"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input, Textarea } from "@/components/ui/field";
import { SingleImageUpload } from "@/components/admin/single-image-upload";
import { slugify } from "@/lib/slugify";
import { createCategory, updateCategory, type CategoryFormState } from "./actions";

type CategoryOption = { id: string; name: string };

type CategoryFormValues = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  parentId: string | null;
};

const initialState: CategoryFormState = {};

export function CategoryFormDialog({
  mode,
  category,
  parentOptions,
  trigger,
}: {
  mode: "create" | "edit";
  category?: CategoryFormValues;
  parentOptions: CategoryOption[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const action =
    mode === "create" ? createCategory : updateCategory.bind(null, category!.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !state.error && !state.fieldErrors) {
      submittedRef.current = false;
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSlugTouched(mode === "edit");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title={mode === "create" ? "Nueva categoría" : `Editar “${category?.name}”`}
      >
        <form
          action={(formData) => {
            submittedRef.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          <FieldWrapper label="Nombre" htmlFor="name" error={state.fieldErrors?.name}>
            <Input
              id="name"
              name="name"
              required
              defaultValue={category?.name}
              onChange={(e) => {
                if (!slugTouched) {
                  const slugInput = document.getElementById("slug") as HTMLInputElement | null;
                  if (slugInput) slugInput.value = slugify(e.target.value);
                }
              }}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Slug"
            htmlFor="slug"
            error={state.fieldErrors?.slug}
            hint="Se usa en la URL pública del catálogo"
          >
            <Input
              id="slug"
              name="slug"
              required
              defaultValue={category?.slug}
              onChange={() => setSlugTouched(true)}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Descripción"
            htmlFor="description"
            error={state.fieldErrors?.description}
          >
            <Textarea id="description" name="description" defaultValue={category?.description ?? ""} />
          </FieldWrapper>

          <FieldWrapper label="Imagen de portada" htmlFor="imageUrl">
            <SingleImageUpload name="imageUrl" subdir="categories" defaultUrl={category?.imageUrl} />
          </FieldWrapper>

          <div className="grid grid-cols-2 gap-4">
            <FieldWrapper label="Orden" htmlFor="order" error={state.fieldErrors?.order}>
              <Input id="order" name="order" type="number" min={0} defaultValue={category?.order ?? 0} />
            </FieldWrapper>

            <FieldWrapper label="Categoría padre" htmlFor="parentId">
              <select
                id="parentId"
                name="parentId"
                defaultValue={category?.parentId ?? ""}
                className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              >
                <option value="">Ninguna (categoría raíz)</option>
                {parentOptions
                  .filter((option) => option.id !== category?.id)
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
              </select>
            </FieldWrapper>
          </div>

          {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
