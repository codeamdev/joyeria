import { prisma } from "@/lib/prisma";
import { StatusSelect } from "./status-select";

export const metadata = { title: "Solicitudes" };

type UnifiedInquiry = {
  id: string;
  kind: "contact" | "custom-order";
  typeLabel: string;
  name: string;
  email: string;
  phone: string | null;
  summary: string;
  detail: string | null;
  referenceImageUrl: string | null;
  status: string;
  createdAt: Date;
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  const [contactMessages, customOrders] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.customOrderRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const unified: UnifiedInquiry[] = [
    ...contactMessages.map((m): UnifiedInquiry => ({
      id: m.id,
      kind: "contact",
      typeLabel: "Contacto",
      name: m.name,
      email: m.email,
      phone: m.phone,
      summary: m.subject ?? m.message.slice(0, 80),
      detail: m.message,
      referenceImageUrl: null,
      status: m.status,
      createdAt: m.createdAt,
    })),
    ...customOrders.map((o): UnifiedInquiry => ({
      id: o.id,
      kind: "custom-order",
      typeLabel: "Encargo personalizado",
      name: o.name,
      email: o.email,
      phone: o.phone,
      summary: `${o.pieceType}${o.desiredMaterial ? ` — ${o.desiredMaterial}` : ""}`,
      detail: o.message,
      referenceImageUrl: o.referenceImageUrl,
      status: o.status,
      createdAt: o.createdAt,
    })),
  ]
    .filter((item) => !params.status || item.status === params.status)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Solicitudes</h1>
      <p className="mt-1 text-sm text-ink/60">Mensajes de contacto y encargos de piezas personalizadas.</p>

      <div className="mt-6 space-y-3">
        {unified.map((item) => (
          <details key={`${item.kind}-${item.id}`} className="rounded-lg border border-ink/10 bg-white/60 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/50">
                    {item.typeLabel}
                  </span>
                  <span className="font-medium text-ink">{item.name}</span>
                  <span className="text-xs text-ink/40">
                    {item.createdAt.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-ink/60">{item.summary}</p>
              </div>
              <StatusSelect id={item.id} status={item.status} kind={item.kind} />
            </summary>
            <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm text-ink/70">
              <p>
                <strong>Correo:</strong> {item.email}
              </p>
              {item.phone ? (
                <p>
                  <strong>Teléfono:</strong> {item.phone}
                </p>
              ) : null}
              {item.detail ? <p className="whitespace-pre-wrap">{item.detail}</p> : null}
              {item.referenceImageUrl ? (
                <a
                  href={item.referenceImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-gold hover:underline"
                >
                  Ver imagen de referencia
                </a>
              ) : null}
            </div>
          </details>
        ))}
        {unified.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink/20 p-8 text-center text-ink/50">
            No hay solicitudes todavía.
          </p>
        ) : null}
      </div>
    </div>
  );
}
