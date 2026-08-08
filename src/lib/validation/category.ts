import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(9999).default(0),
  parentId: z.string().trim().optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
