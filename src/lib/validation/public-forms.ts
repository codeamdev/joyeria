import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

// El honeypot debe llegar vacío: un bot que autocompleta todos los campos lo
// llenará; un humano nunca lo ve (está oculto con CSS, nunca con display:none
// para no ser filtrado por los propios bots).
const honeypot = z.string().max(0).optional().or(z.literal(""));

export const contactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.string().trim().email("Correo inválido"),
  phone: optionalText(30),
  subject: optionalText(160),
  message: z.string().trim().min(1, "El mensaje es obligatorio").max(3000),
  website: honeypot,
});

export const customOrderSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.string().trim().email("Correo inválido"),
  phone: optionalText(30),
  pieceType: z.string().trim().min(1, "Cuéntanos qué tipo de pieza quieres").max(160),
  desiredMaterial: optionalText(120),
  budgetRange: optionalText(120),
  referenceImageUrl: optionalText(500),
  message: optionalText(3000),
  website: honeypot,
});
