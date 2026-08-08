"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/request-ip";
import { checkRateLimit, customOrderRateLimiter } from "@/lib/rate-limit";
import { customOrderSchema } from "@/lib/validation/public-forms";
import { flattenErrors } from "@/lib/validation/flatten-errors";

export type CustomOrderFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function submitCustomOrderRequest(
  _prevState: CustomOrderFormState,
  formData: FormData,
): Promise<CustomOrderFormState> {
  const requestHeaders = await headers();
  const ip = getClientIp(requestHeaders) ?? "unknown";

  const rateLimit = await checkRateLimit(customOrderRateLimiter, ip);
  if (!rateLimit.allowed) {
    return { error: "Demasiados envíos. Intenta de nuevo más tarde." };
  }

  const parsed = customOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: flattenErrors(parsed.error) };
  }
  const data = parsed.data;

  if (data.website) {
    return { success: true };
  }

  await prisma.customOrderRequest.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      pieceType: data.pieceType,
      desiredMaterial: data.desiredMaterial || null,
      budgetRange: data.budgetRange || null,
      referenceImageUrl: data.referenceImageUrl || null,
      message: data.message || null,
      ipAddress: ip,
    },
  });

  return { success: true };
}
