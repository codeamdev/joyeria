"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Lock } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nuestra-historia", label: "Nuestra historia" },
  { href: "/personalizacion", label: "Piezas personalizadas" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-serif text-lg tracking-wide text-ink" onClick={() => setOpen(false)}>
          Joyería y Platería AJ
        </Link>

        <div className="flex items-center gap-5">
          <nav className="hidden gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition hover:text-gold ${
                  pathname === link.href ? "text-gold" : "text-ink/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Panel de administración"
            title="Panel de administración"
            className="hidden text-ink/35 transition hover:text-ink/70 md:inline-flex"
          >
            <Lock size={16} />
          </Link>

          <button
            type="button"
            className="p-2 text-ink md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-ink/10 bg-ivory px-4 pb-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm ${pathname === link.href ? "text-gold" : "text-ink/70"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Panel de administración"
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex border-t border-ink/10 pt-3 text-ink/35"
          >
            <Lock size={16} />
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
