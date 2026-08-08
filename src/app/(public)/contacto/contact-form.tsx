"use client";

import { useActionState } from "react";
import { FieldWrapper, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { submitContactMessage, type ContactFormState } from "./actions";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white/60 p-6 text-center">
        <p className="font-serif text-lg text-ink">¡Gracias por escribirnos!</p>
        <p className="mt-2 text-sm text-ink/60">Te responderemos lo antes posible.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white/60 p-6">
      {/* Honeypot: oculto por posición, no por display:none, para no ser detectado por bots simples */}
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
      <FieldWrapper label="Asunto (opcional)" htmlFor="subject">
        <Input id="subject" name="subject" />
      </FieldWrapper>
      <FieldWrapper label="Mensaje" htmlFor="message" error={state.fieldErrors?.message}>
        <Textarea id="message" name="message" required className="min-h-32" />
      </FieldWrapper>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
