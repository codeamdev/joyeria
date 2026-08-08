import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const siteSettingsSchema = z.object({
  whatsappNumber: optionalText(30),
  contactEmail: z.string().trim().email("Correo inválido").optional().or(z.literal("")),
  contactPhone: optionalText(30),
  address: optionalText(300),
  storyTitle: optionalText(160),
  storyIntro: optionalText(2000),
  instagramUrl: optionalText(300),
  facebookUrl: optionalText(300),
  tiktokUrl: optionalText(300),
  currency: z.string().trim().min(3).max(3).default("COP"),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const storySectionSchema = z.object({
  order: z.coerce.number().int().min(0).max(999).default(0),
  title: z.string().trim().min(1, "El título es obligatorio").max(160),
  body: z.string().trim().min(1, "El contenido es obligatorio").max(4000),
  imageUrl: optionalText(500),
  videoUrl: optionalText(500),
});

export type StorySectionInput = z.infer<typeof storySectionSchema>;
