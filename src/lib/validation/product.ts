import { z } from "zod";

export const MATERIAL_VALUES = ["ORO", "PLATA", "ORO_PLATA", "OTRO"] as const;
export const STATUS_VALUES = ["DISPONIBLE", "RESERVADO", "VENDIDO", "HECHO_A_PEDIDO"] as const;

export const MATERIAL_LABELS: Record<(typeof MATERIAL_VALUES)[number], string> = {
  ORO: "Oro",
  PLATA: "Plata",
  ORO_PLATA: "Oro + Plata",
  OTRO: "Otro",
};

export const STATUS_LABELS: Record<(typeof STATUS_VALUES)[number], string> = {
  DISPONIBLE: "Disponible",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  HECHO_A_PEDIDO: "Hecho a pedido",
};

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalNumber = z.coerce.number().finite().optional().nullable();

export const gemstoneSchema = z.object({
  type: z.string().trim().min(1, "Tipo de piedra requerido").max(80),
  carat: optionalNumber,
  color: optionalText(80),
  clarity: optionalText(80),
  cut: optionalText(80),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
});

export const productImageSchema = z.object({
  url: z.string().trim().min(1),
  order: z.coerce.number().int().min(0),
  isMain: z.boolean().default(false),
  altText: optionalText(200),
});

export const productSchema = z.object({
  sku: z.string().trim().min(1, "El SKU es obligatorio").max(60),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones"),
  description: optionalText(5000),
  shortDescription: optionalText(300),
  categoryId: z.string().trim().min(1, "Selecciona una categoría"),
  material: z.enum(MATERIAL_VALUES),
  purity: optionalText(20),
  weightGrams: optionalNumber,
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0").max(999_999_999),
  internalCost: optionalNumber,
  isOneOfAKind: z.boolean().default(false),
  isCustomizable: z.boolean().default(false),
  productionTimeDays: z.coerce.number().int().min(0).max(3650).optional().nullable(),
  status: z.enum(STATUS_VALUES).default("DISPONIBLE"),
  careInstructions: optionalText(3000),
  ringSize: optionalText(40),
  chainLengthCm: optionalNumber,
  braceletLengthCm: optionalNumber,
  dimensionsNote: optionalText(500),
  certifyingEntity: optionalText(200),
  certificationNumber: optionalText(200),
  metaTitle: optionalText(160),
  metaDescription: optionalText(300),
  featured: z.boolean().default(false),
  gemstones: z.array(gemstoneSchema).max(20).default([]),
  images: z.array(productImageSchema).max(24).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
export type GemstoneInput = z.infer<typeof gemstoneSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
