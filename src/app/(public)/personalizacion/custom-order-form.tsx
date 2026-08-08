"use client";

import { useActionState } from "react";
import { FieldWrapper, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ReferenceImageUpload } from "./reference-image-upload";
import { submitCustomOrderRequest, type CustomOrderFormState } from "./actions";

const initialState: CustomOrderFormState = {};

export function CustomOrderForm({ defaultPieceType }: { defaultPieceType?: string }) {
  const [state, formAction, isPending] = useActionState(submitCustomOrderRequest, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white/60 p-6 text-center">
        <p className="font-serif text-lg text-ink">¡Recibimos tu solicitud!</p>
        <p className="mt-2 text-sm text-ink/60">
          Nos pondremos en contacto contigo pronto para hablar sobre tu pieza.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white/60 p-6">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">No completar</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Nombre" htmlFor="name" error={state.fieldErrors?.name}>
          <Input id="name" name="name" required />
        </FieldWrapper>
        <FieldWrapper label="Correo" htmlFor="email" error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" required />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Teléfono (opcional)" htmlFor="phone">
        <Input id="phone" name="phone" />
      </FieldWrapper>
      <FieldWrapper label="Tipo de pieza" htmlFor="pieceType" error={state.fieldErrors?.pieceType}>
        <Input id="pieceType" name="pieceType" required defaultValue={defaultPieceType} />
      </FieldWrapper>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Material deseado" htmlFor="desiredMaterial">
          <Input id="desiredMaterial" name="desiredMaterial" placeholder="Oro, plata…" />
        </FieldWrapper>
        <FieldWrapper label="Presupuesto aproximado" htmlFor="budgetRange">
          <Input id="budgetRange" name="budgetRange" placeholder="ej. $300.000 - $500.000" />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Imagen de referencia" htmlFor="referenceImageUrl">
        <ReferenceImageUpload name="referenceImageUrl" />
      </FieldWrapper>
      <FieldWrapper label="Cuéntanos tu idea" htmlFor="message">
        <Textarea id="message" name="message" className="min-h-28" />
      </FieldWrapper>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enviando…" : "Enviar solicitud"}
      </Button>
    </form>
  );
}
