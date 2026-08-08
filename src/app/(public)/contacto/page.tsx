import type { Metadata } from "next";
import { getOrCreateSiteSettings } from "@/lib/site-settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos por WhatsApp o por el formulario de contacto.",
};

export default async function ContactPage() {
  const settings = await getOrCreateSiteSettings();
  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber, "Hola, quisiera más información.");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl text-ink">Contacto</h1>
      <p className="mt-2 text-ink/60">
        Escríbenos por WhatsApp para una respuesta inmediata, o completa el formulario.
      </p>

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-md bg-[#25D366] px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Escribir por WhatsApp
        </a>
      ) : null}

      <div className="mt-4 space-y-1 text-sm text-ink/60">
        {settings.contactPhone ? <p>Teléfono: {settings.contactPhone}</p> : null}
        {settings.contactEmail ? <p>Correo: {settings.contactEmail}</p> : null}
        {settings.address ? <p>Dirección: {settings.address}</p> : null}
      </div>

      <div className="relative mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
