import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string("O nome da categoria é obrigatório.")
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  color: z
    .string("A cor é obrigatória.")
    .regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, "Cor inválida. Use formato hex (ex: #f97316).")
    .default("#f97316"),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
