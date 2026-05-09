import { z } from "zod";

export const createExpenseSchema = z.object({
  type: z.enum(["material", "pedreiro", "servente", "alimentacao", "combustivel", "outro"] as const, { errorMap: () => ({ message: "Tipo de despesa inválido ou obrigatório." }) }),
  categoryId: z.string().uuid("ID de categoria inválido.").nullable().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  description: z
    .string("A descrição é obrigatória.")
    .trim()
    .min(1, "A descrição é obrigatória.")
    .max(255, "A descrição deve ter no máximo 255 caracteres."),
  amount: z
    .number({ invalid_type_error: "O valor é obrigatório." })
    .positive("O valor deve ser maior que zero.")
    .max(9_999_999.99, "Valor excede o limite permitido."),
  expenseDate: z
    .string("A data é obrigatória.")
    .datetime({ offset: true, message: "Data inválida." })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida. Use o formato YYYY-MM-DD.")),
});

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;
