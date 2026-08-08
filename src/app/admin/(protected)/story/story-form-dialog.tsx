"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input, Textarea } from "@/components/ui/field";
import { SingleImageUpload } from "@/components/admin/single-image-upload";
import { SingleVideoUpload } from "@/components/admin/single-video-upload";
import { createStorySection, updateStorySection, type StoryFormState } from "./actions";

type StorySectionValues = {
  id: string;
  order: number;
  title: string;
  body: string;
  imageUrl: string | null;
  videoUrl: string | null;
};

const initialState: StoryFormState = {};

export function StoryFormDialog({
  mode,
  section,
  trigger,
}: {
  mode: "create" | "edit";
  section?: StorySectionValues;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const action = mode === "create" ? createStorySection : updateStorySection.bind(null, section!.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !state.error && !state.fieldErrors) {
      submittedRef.current = false;
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={mode === "create" ? "Nuevo bloque de historia" : `Editar “${section?.title}”`}>
        <form
          action={(formData) => {
            submittedRef.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          <FieldWrapper label="Orden" htmlFor="order" error={state.fieldErrors?.order}>
            <Input id="order" name="order" type="number" min={0} defaultValue={section?.order ?? 0} />
          </FieldWrapper>
          <FieldWrapper label="Título" htmlFor="title" error={state.fieldErrors?.title}>
            <Input id="title" name="title" required defaultValue={section?.title} />
          </FieldWrapper>
          <FieldWrapper label="Contenido" htmlFor="body" error={state.fieldErrors?.body}>
            <Textarea id="body" name="body" required defaultValue={section?.body} className="min-h-32" />
          </FieldWrapper>
          <FieldWrapper label="Imagen" htmlFor="imageUrl">
            <SingleImageUpload name="imageUrl" subdir="story" defaultUrl={section?.imageUrl} />
          </FieldWrapper>
          <FieldWrapper label="Video (opcional)" htmlFor="videoUrl">
            <SingleVideoUpload name="videoUrl" subdir="story" defaultUrl={section?.videoUrl} />
          </FieldWrapper>

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
