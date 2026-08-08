"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateContactMessageStatus, updateCustomOrderStatus } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  IN_PROGRESS: "En gestión",
  CLOSED: "Cerrado",
};

export function StatusSelect({
  id,
  status,
  kind,
}: {
  id: string;
  status: string;
  kind: "contact" | "custom-order";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          if (kind === "contact") await updateContactMessageStatus(id, next);
          else await updateCustomOrderStatus(id, next);
          router.refresh();
        });
      }}
      className="rounded-md border border-ink/15 bg-white px-2 py-1 text-xs outline-none focus:border-gold"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
