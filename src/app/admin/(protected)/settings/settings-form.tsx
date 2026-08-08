"use client";

import { useActionState } from "react";
import { FieldWrapper, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updateSiteSettings, type SettingsFormState } from "./actions";

type SettingsValues = {
  whatsappNumber: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  storyTitle: string | null;
  storyIntro: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  currency: string;
};

const initialState: SettingsFormState = {};

export function SettingsForm({ settings }: { settings: SettingsValues }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Contacto</h2>
        <FieldWrapper label="WhatsApp" htmlFor="whatsappNumber" hint="Formato internacional, ej. 573001234567" error={state.fieldErrors?.whatsappNumber}>
          <Input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber ?? ""} />
        </FieldWrapper>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper label="Correo de contacto" htmlFor="contactEmail" error={state.fieldErrors?.contactEmail}>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} />
          </FieldWrapper>
          <FieldWrapper label="Teléfono de contacto" htmlFor="contactPhone">
            <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone ?? ""} />
          </FieldWrapper>
        </div>
        <FieldWrapper label="Dirección" htmlFor="address">
          <Input id="address" name="address" defaultValue={settings.address ?? ""} />
        </FieldWrapper>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Nuestra historia (adelanto en inicio)</h2>
        <FieldWrapper label="Título" htmlFor="storyTitle">
          <Input id="storyTitle" name="storyTitle" defaultValue={settings.storyTitle ?? ""} />
        </FieldWrapper>
        <FieldWrapper label="Introducción" htmlFor="storyIntro">
          <Textarea id="storyIntro" name="storyIntro" defaultValue={settings.storyIntro ?? ""} />
        </FieldWrapper>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Redes sociales</h2>
        <FieldWrapper label="Instagram" htmlFor="instagramUrl">
          <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
        </FieldWrapper>
        <FieldWrapper label="Facebook" htmlFor="facebookUrl">
          <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
        </FieldWrapper>
        <FieldWrapper label="TikTok" htmlFor="tiktokUrl">
          <Input id="tiktokUrl" name="tiktokUrl" defaultValue={settings.tiktokUrl ?? ""} />
        </FieldWrapper>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Moneda</h2>
        <FieldWrapper label="Código de moneda (ISO 4217)" htmlFor="currency" hint="ej. COP, USD, MXN" error={state.fieldErrors?.currency}>
          <Input id="currency" name="currency" defaultValue={settings.currency} maxLength={3} />
        </FieldWrapper>
      </section>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-700">Guardado correctamente.</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando…" : "Guardar configuración"}
      </Button>
    </form>
  );
}
