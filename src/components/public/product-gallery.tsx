"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { url: string; altText: string | null };

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (!current) {
    return <div className="aspect-square rounded-lg bg-surface" />;
  }

  return (
    <div>
      <div className="group relative aspect-square overflow-hidden rounded-lg bg-surface">
        <Image
          src={current.url}
          alt={current.altText || productName}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-110"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-md border ${
                index === active ? "border-gold" : "border-transparent"
              }`}
            >
              <Image
                src={image.url}
                alt={image.altText || productName}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
