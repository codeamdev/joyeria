"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroImage = { id: string; url: string; altText: string | null };

export function HeroVideo({ url, posterUrl }: { url: string; posterUrl: string | null }) {
  return (
    <video
      src={url}
      poster={posterUrl ?? undefined}
      autoPlay
      muted
      loop
      playsInline
      className="h-full w-full object-cover"
    />
  );
}

export function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {images.map((image, i) => (
        <div
          key={image.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={image.url}
            alt={image.altText || ""}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}
      {images.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Ver imagen ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-ivory" : "w-1.5 bg-ivory/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
