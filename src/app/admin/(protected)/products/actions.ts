"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActionSession } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
import { productSchema, type ProductInput } from "@/lib/validation/product";
import { flattenErrors } from "@/lib/validation/flatten-errors";

export type ProductActionResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
  productId?: string;
};

function toNullableString(value: string | undefined | null) {
  return value && value.length > 0 ? value : null;
}

function buildProductData(data: ProductInput) {
  return {
    sku: data.sku,
    name: data.name,
    slug: data.slug,
    description: toNullableString(data.description),
    shortDescription: toNullableString(data.shortDescription),
    categoryId: data.categoryId,
    material: data.material,
    purity: toNullableString(data.purity),
    weightGrams: data.weightGrams ?? null,
    price: data.price,
    internalCost: data.internalCost ?? null,
    isOneOfAKind: data.isOneOfAKind,
    isCustomizable: data.isCustomizable,
    productionTimeDays: data.productionTimeDays ?? null,
    status: data.status,
    careInstructions: toNullableString(data.careInstructions),
    ringSize: toNullableString(data.ringSize),
    chainLengthCm: data.chainLengthCm ?? null,
    braceletLengthCm: data.braceletLengthCm ?? null,
    dimensionsNote: toNullableString(data.dimensionsNote),
    certifyingEntity: toNullableString(data.certifyingEntity),
    certificationNumber: toNullableString(data.certificationNumber),
    metaTitle: toNullableString(data.metaTitle),
    metaDescription: toNullableString(data.metaDescription),
    featured: data.featured,
  } satisfies Prisma.ProductUncheckedUpdateInput;
}

function ensureSingleMainImage(images: ProductInput["images"]) {
  if (images.length === 0) return images;
  const hasMain = images.some((image) => image.isMain);
  return images.map((image, index) => ({
    ...image,
    isMain: hasMain ? image.isMain : index === 0,
  }));
}

export async function createProduct(input: ProductInput): Promise<ProductActionResult> {
  const session = await requireActionSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: flattenErrors(parsed.error) };
  }
  const data = parsed.data;
  const images = ensureSingleMainImage(data.images);

  let productId: string;
  try {
    const product = await prisma.product.create({
      data: {
        ...buildProductData(data),
        gemstones: { create: data.gemstones },
        images: {
          create: images.map((image) => ({
            url: image.url,
            order: image.order,
            isMain: image.isMain,
            altText: toNullableString(image.altText),
          })),
        },
      },
    });
    productId = product.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(",") ?? "";
      if (target.includes("sku")) return { error: "Ya existe un producto con ese SKU" };
      if (target.includes("slug")) return { error: "Ya existe un producto con ese slug" };
      return { error: "Valor duplicado" };
    }
    throw error;
  }

  const ip = getClientIp(await headers());
  await logAudit({
    action: "CREATE",
    entityType: "Product",
    entityId: productId,
    adminUserId: session.user.id,
    ipAddress: ip,
    changes: { sku: data.sku, name: data.name, price: data.price },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalogo");
  return { productId };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ProductActionResult> {
  const session = await requireActionSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: flattenErrors(parsed.error) };
  }
  const data = parsed.data;
  const images = ensureSingleMainImage(data.images);

  try {
    const before = await prisma.product.findUnique({ where: { id } });
    if (!before) return { error: "Producto no encontrado" };

    await prisma.$transaction([
      prisma.gemstone.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          ...buildProductData(data),
          gemstones: { create: data.gemstones },
          images: {
            create: images.map((image) => ({
              url: image.url,
              order: image.order,
              isMain: image.isMain,
              altText: toNullableString(image.altText),
            })),
          },
        },
      }),
    ]);

    const ip = getClientIp(await headers());
    await logAudit({
      action: "UPDATE",
      entityType: "Product",
      entityId: id,
      adminUserId: session.user.id,
      ipAddress: ip,
      changes: {
        before: { price: before.price, status: before.status, internalCost: before.internalCost },
        after: { price: data.price, status: data.status, internalCost: data.internalCost },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(",") ?? "";
      if (target.includes("sku")) return { error: "Ya existe un producto con ese SKU" };
      if (target.includes("slug")) return { error: "Ya existe un producto con ese slug" };
      return { error: "Valor duplicado" };
    }
    throw error;
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalogo");
  revalidatePath(`/producto/${data.slug}`);
  return { productId: id };
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const session = await requireActionSession();
  const product = await prisma.product.delete({ where: { id } }).catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return null;
    }
    throw error;
  });

  if (!product) return { error: "Producto no encontrado" };

  const ip = getClientIp(await headers());
  await logAudit({
    action: "DELETE",
    entityType: "Product",
    entityId: id,
    adminUserId: session.user.id,
    ipAddress: ip,
    changes: { sku: product.sku, name: product.name },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalogo");
  return {};
}
