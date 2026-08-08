"use client";

import { Plus, Trash2 } from "lucide-react";

export type GemstoneItem = {
  id: string;
  type: string;
  carat: number | null;
  color: string;
  clarity: string;
  cut: string;
  quantity: number;
};

const COMMON_GEMSTONES = [
  "Diamante",
  "Esmeralda",
  "Rubí",
  "Zafiro",
  "Perla",
  "Amatista",
  "Topacio",
  "Aguamarina",
  "Ónix",
  "Circón",
];

export function GemstoneFields({
  value,
  onChange,
}: {
  value: GemstoneItem[];
  onChange: (gemstones: GemstoneItem[]) => void;
}) {
  function update(id: string, patch: Partial<GemstoneItem>) {
    onChange(value.map((gem) => (gem.id === id ? { ...gem, ...patch } : gem)));
  }
  function remove(id: string) {
    onChange(value.filter((gem) => gem.id !== id));
  }
  function add() {
    onChange([
      ...value,
      { id: crypto.randomUUID(), type: "", carat: null, color: "", clarity: "", cut: "", quantity: 1 },
    ]);
  }

  const inputClass = "rounded border border-ink/15 px-2 py-1.5 text-sm outline-none focus:border-gold";

  return (
    <div className="space-y-3">
      <datalist id="gemstone-types">
        {COMMON_GEMSTONES.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {value.map((gem) => (
        <div key={gem.id} className="flex flex-wrap items-center gap-2 rounded-md border border-ink/10 p-3">
          <input
            list="gemstone-types"
            value={gem.type}
            onChange={(e) => update(gem.id, { type: e.target.value })}
            placeholder="Tipo (ej. Diamante)"
            className={`${inputClass} w-36 flex-1`}
          />
          <input
            type="number"
            step="0.001"
            min="0"
            value={gem.carat ?? ""}
            onChange={(e) => update(gem.id, { carat: e.target.value === "" ? null : Number(e.target.value) })}
            placeholder="Quilates"
            className={`${inputClass} w-24`}
          />
          <input
            value={gem.color}
            onChange={(e) => update(gem.id, { color: e.target.value })}
            placeholder="Color"
            className={`${inputClass} w-24`}
          />
          <input
            value={gem.clarity}
            onChange={(e) => update(gem.id, { clarity: e.target.value })}
            placeholder="Claridad"
            className={`${inputClass} w-24`}
          />
          <input
            value={gem.cut}
            onChange={(e) => update(gem.id, { cut: e.target.value })}
            placeholder="Corte"
            className={`${inputClass} w-24`}
          />
          <input
            type="number"
            min="1"
            value={gem.quantity}
            onChange={(e) => update(gem.id, { quantity: Number(e.target.value) || 1 })}
            placeholder="Cant."
            className={`${inputClass} w-16`}
          />
          <button
            type="button"
            onClick={() => remove(gem.id)}
            className="ml-auto rounded p-1.5 text-red-700 hover:bg-red-50"
            aria-label="Quitar piedra"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-ink/70 hover:text-ink"
      >
        <Plus size={16} /> Agregar piedra
      </button>
    </div>
  );
}
