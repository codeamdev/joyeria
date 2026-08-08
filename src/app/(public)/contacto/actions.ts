"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/request-ip";
import { checkRateLimit, contactFormRateLimiter } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation/public-forms";
import { flattenErrors } from "@/lib/validation/flatten-errors";

export type ContactFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const requestHeaders = await headers();
  const ip = getClientIp(requestHeaders) ?? "unknown";

  const rateLimit = await checkRateLimit(contactFormRateLimiter, ip);
  if (!rateLimit.allowed) {
    return { error: "Demasiados envíos. Intenta de nuevo más tarde." };
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: flattenErrors(parsed.error) };
  }
  const data = parsed.data;

  // Honeypot lleno: probablemente un bot. Respondemos éxito sin escribir nada.
  if (data.website) {
    return { success: true };
  }

  await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
      ipAddress: ip,
    },
  });

  return { success: true };
}
