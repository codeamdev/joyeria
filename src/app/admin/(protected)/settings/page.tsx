import { requirePageRole } from "@/lib/admin-auth";
import { getOrCreateSiteSettings } from "@/lib/site-settings";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  await requirePageRole("ADMIN");
  const settings = await getOrCreateSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl text-ink">Configuración del sitio</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
