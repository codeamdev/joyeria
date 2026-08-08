import { z } from "zod";

export const ROLE_VALUES = ["ADMIN", "EDITOR"] as const;
export const ROLE_LABELS: Record<(typeof ROLE_VALUES)[number], string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
};

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(10, "Mínimo 10 caracteres").max(200),
  role: z.enum(ROLE_VALUES),
});

export const updateAdminUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  role: z.enum(ROLE_VALUES),
  isActive: z.coerce.boolean(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(10, "Mínimo 10 caracteres").max(200),
});
