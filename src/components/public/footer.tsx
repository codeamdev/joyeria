import Link from "next/link";
import { getOrCreateSiteSettings } from "@/lib/site-settings";

export async function Footer() {
  const settings = await getOrCreateSiteSettings();

  return (
    <footer className="border-t border-ink/10 bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-lg text-ink">Joyería y Platería AJ</p>
          <p className="mt-2 text-sm text-ink/60">
            Joyería artesanal en oro y plata, fabricación propia y piezas personalizadas por encargo.
          </p>
        </div>

        <div className="text-sm text-ink/70">
          <p className="mb-2 font-medium text-ink">Navegación</p>
          <ul className="space-y-1.5">
            <li><Link href="/catalogo" className="hover:text-gold">Catálogo</Link></li>
            <li><Link href="/nuestra-historia" className="hover:text-gold">Nuestra historia</Link></li>
            <li><Link href="/personalizacion" className="hover:text-gold">Piezas personalizadas</Link></li>
            <li><Link href="/contacto" className="hover:text-gold">Contacto</Link></li>
          </ul>
        </div>

        <div className="text-sm text-ink/70">
          <p className="mb-2 font-medium text-ink">Contacto</p>
          <ul className="space-y-1.5">
            {settings.contactPhone ? <li>{settings.contactPhone}</li> : null}
            {settings.contactEmail ? <li>{settings.contactEmail}</li> : null}
            {settings.address ? <li>{settings.address}</li> : null}
          </ul>
          <div className="mt-3 flex gap-3">
            {settings.instagramUrl ? (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-gold">
                Instagram
              </a>
            ) : null}
            {settings.facebookUrl ? (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-gold">
                Facebook
              </a>
            ) : null}
            {settings.tiktokUrl ? (
              <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="hover:text-gold">
                TikTok
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-t border-ink/10 py-4 text-center text-xs text-ink/40">
        © {new Date().getFullYear()} Joyería y Platería AJ. Todas las piezas son de fabricación propia.
      </div>
    </footer>
  );
}
