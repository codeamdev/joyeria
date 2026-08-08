import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getOrCreateSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Nuestra historia",
  description: "Conoce el proceso artesanal detrás de cada pieza de Joyería y Platería AJ.",
};

export default async function StoryPage() {
  const [sections, settings] = await Promise.all([
    prisma.storySection.findMany({ orderBy: { order: "asc" } }),
    getOrCreateSiteSettings(),
  ]);

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">{settings.storyTitle || "Nuestra historia"}</h1>
        {settings.storyIntro ? <p className="mt-4 text-lg text-ink/70">{settings.storyIntro}</p> : null}
      </section>

      <div className="space-y-20 pb-20">
        {sections.map((section, index) => {
          const reverse = index % 2 === 1;
          return (
            <section key={section.id} className="mx-auto max-w-5xl px-4">
              <div className={`grid items-center gap-8 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface">
                  {section.videoUrl ? (
                    <video src={section.videoUrl} controls className="h-full w-full object-cover" />
                  ) : section.imageUrl ? (
                    <Image
                      src={section.imageUrl}
                      alt={section.title}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-ink">{section.title}</h2>
                  <p className="mt-4 whitespace-pre-wrap text-ink/70">{section.body}</p>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {sections.length === 0 ? (
        <p className="pb-20 text-center text-ink/50">Muy pronto compartiremos nuestro proceso artesanal aquí.</p>
      ) : null}
    </div>
  );
}
