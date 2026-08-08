"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { MATERIAL_LABELS, MATERIAL_VALUES } from "@/lib/validation/product";

type Suggestion = { slug: string; name: string; imageUrl: string | null };

export function CatalogFilters({
  categories,
  gemstoneTypes,
}: {
  categories: Array<{ id: string; name: string }>;
  gemstoneTypes: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/public/search-suggestions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.results ?? []);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={query}
            placeholder="Buscar piezas…"
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowSuggestions(false);
                updateParams({ q: query || null });
              }
            }}
            className="w-full rounded-md border border-ink/15 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
          {query ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => {
                setQuery("");
                updateParams({ q: null });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {showSuggestions && suggestions.length > 0 ? (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-ink/10 bg-white shadow-lg">
            {suggestions.map((s) => (
              <Link
                key={s.slug}
                href={`/producto/${s.slug}`}
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-surface"
              >
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-surface">
                  {s.imageUrl ? <Image src={s.imageUrl} alt="" fill sizes="32px" className="object-cover" /> : null}
                </div>
                {s.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={searchParams.get("categoryId") ?? ""}
          onChange={(e) => updateParams({ categoryId: e.target.value || null })}
          className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("material") ?? ""}
          onChange={(e) => updateParams({ material: e.target.value || null })}
          className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">Todos los materiales</option>
          {MATERIAL_VALUES.map((m) => (
            <option key={m} value={m}>
              {MATERIAL_LABELS[m]}
            </option>
          ))}
        </select>

        {gemstoneTypes.length > 0 ? (
          <select
            value={searchParams.get("gemstone") ?? ""}
            onChange={(e) => updateParams({ gemstone: e.target.value || null })}
            className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          >
            <option value="">Todas las piedras</option>
            {gemstoneTypes.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        ) : null}

        <input
          type="number"
          min={0}
          placeholder="Precio mín."
          defaultValue={searchParams.get("minPrice") ?? ""}
          onBlur={(e) => updateParams({ minPrice: e.target.value || null })}
          className="w-28 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          type="number"
          min={0}
          placeholder="Precio máx."
          defaultValue={searchParams.get("maxPrice") ?? ""}
          onBlur={(e) => updateParams({ maxPrice: e.target.value || null })}
          className="w-28 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        />

        <label className="flex items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={searchParams.get("unique") === "1"}
            onChange={(e) => updateParams({ unique: e.target.checked ? "1" : null })}
          />
          Solo piezas únicas
        </label>
      </div>
    </div>
  );
}
