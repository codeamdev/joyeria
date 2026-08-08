import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
      status: { not: "VENDIDO" },
    },
    select: {
      slug: true,
      name: true,
      images: { where: { isMain: true }, take: 1, select: { url: true } },
    },
    take: 8,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    results: products.map((p) => ({ slug: p.slug, name: p.name, imageUrl: p.images[0]?.url ?? null })),
  });
}
