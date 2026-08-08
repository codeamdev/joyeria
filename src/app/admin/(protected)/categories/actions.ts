"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActionSession } from "@/lib/admin-auth";
import { categorySchema } from "@/lib/validation/category";
import { flattenErrors } from "@/lib/validation/flatten-errors";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/request-ip";

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const session = await requireActionSession();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: flattenErrors(parsed.error) };
  }
  const data = parsed.data;

  if (data.parentId) {
    const parentExists = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parentExists) return { error: "La categoría padre seleccionada no existe" };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: toNullable(data.description),
        imageUrl: toNullable(data.imageUrl),
        order: data.order,
        parentId: toNullable(data.parentId),
      },
    });
    const ip = getClientIp(await headers());
    await logAudit({
      action: "CREATE",
      entityType: "Category",
      entityId: category.id,
      adminUserId: session.user.id,
      ipAddress: ip,
      changes: { name: category.name, slug: category.slug },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ya existe una categoría con ese slug" };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/catalogo");
  return {};
}

export async function updateCategory(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const session = await requireActionSession();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: flattenErrors(parsed.error) };
  }
  const data = parsed.data;

  if (data.parentId === id) {
    return { error: "Una categoría no puede ser su propia categoría padre" };
  }
  if (data.parentId) {
    const parentExists = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parentExists) return { error: "La categoría padre seleccionada no existe" };
  }

  try {
    const before = await prisma.category.findUnique({ where: { id } });
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: toNullable(data.description),
        imageUrl: toNullable(data.imageUrl),
        order: data.order,
        parentId: toNullable(data.parentId),
      },
    });
    const ip = getClientIp(await headers());
    await logAudit({
      action: "UPDATE",
      entityType: "Category",
      entityId: category.id,
      adminUserId: session.user.id,
      ipAddress: ip,
      changes: { before, after: category },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ya existe una categoría con ese slug" };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/catalogo");
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const session = await requireActionSession();
  try {
    const category = await prisma.category.delete({ where: { id } });
    const ip = getClientIp(await headers());
    await logAudit({
      action: "DELETE",
      entityType: "Category",
      entityId: id,
      adminUserId: session.user.id,
      ipAddress: ip,
      changes: { name: category.name, slug: category.slug },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { error: "No se puede eliminar: tiene productos o subcategorías asociadas" };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/catalogo");
  return {};
}
