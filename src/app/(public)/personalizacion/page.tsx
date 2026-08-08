import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CustomOrderForm } from "./custom-order-form";

export const metadata: Metadata = {
  title: "Piezas personalizadas",
  description: "Diseñamos y fabricamos piezas de joyería a la medida, en oro o plata.",
};

export default async function CustomOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  let defaultPieceType: string | undefined;

  if (params.ref) {
    const product = await prisma.product.findUnique({
      where: { slug: params.ref },
      select: { name: true },
    });
    if (product) defaultPieceType = `Similar a "${product.name}"`;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl text-ink">Piezas personalizadas</h1>
      <p className="mt-2 text-ink/60">
        Cada pieza que fabricamos puede adaptarse a tu idea: material, piedra, tamaño y presupuesto.
        Cuéntanos qué tienes en mente y te contactamos para definir los detalles.
      </p>

      <div className="relative mt-8">
        <CustomOrderForm defaultPieceType={defaultPieceType} />
      </div>
    </div>
  );
}
