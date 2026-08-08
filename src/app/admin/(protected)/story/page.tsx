import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { StoryFormDialog } from "./story-form-dialog";
import { StoryRowActions } from "./story-row-actions";

export const metadata = { title: "Nuestra historia" };

export default async function StoryPage() {
  await requirePageRole("ADMIN");
  const sections = await prisma.storySection.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Nuestra historia / Proceso artesanal</h1>
        <StoryFormDialog
          mode="create"
          trigger={
            <Button>
              <Plus size={16} /> Nuevo bloque
            </Button>
          }
        />
      </div>
      <p className="mt-1 text-sm text-ink/60">
        Estos bloques arman el storytelling con scroll de la página pública “Nuestra historia”.
      </p>

      <div className="mt-6 space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="flex items-start justify-between rounded-lg border border-ink/10 bg-white/60 p-4">
            <div>
              <p className="text-xs text-ink/40">Orden {section.order}</p>
              <p className="font-medium text-ink">{section.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink/60">{section.body}</p>
            </div>
            <StoryRowActions section={section} />
          </div>
        ))}
        {sections.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink/20 p-8 text-center text-ink/50">
            No hay bloques de historia todavía.
          </p>
        ) : null}
      </div>
    </div>
  );
}
