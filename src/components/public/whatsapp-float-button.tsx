import { MessageCircle } from "lucide-react";
import { getOrCreateSiteSettings } from "@/lib/site-settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function WhatsAppFloatButton() {
  const settings = await getOrCreateSiteSettings();
  const url = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Hola, quisiera más información sobre sus joyas.",
  );
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
    >
      <MessageCircle size={26} />
    </a>
  );
}
