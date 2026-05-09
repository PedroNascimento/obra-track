import { z } from "zod";

export const expenseFilterSchema = z.object({
  period: z.enum(["weekly", "monthly", "total", "custom"]).default("monthly"),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.").optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.").optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).refine(
  (data) => {
    if (data.period === "custom") {
      return !!data.from && !!data.to;
    }
    return true;
  },
  { message: "Período personalizado requer 'from' e 'to'.", path: ["from"] }
);

export type ExpenseFilterDTO = z.infer<typeof expenseFilterSchema>;

/** Converte os query params (string) para ExpenseFilter do domínio */
export function parseExpenseFilterFromQuery(params: Record<string, string | string[] | undefined>) {
  const raw = {
    period: params.period as string | undefined,
    from: params.from as string | undefined,
    to: params.to as string | undefined,
    page: params.page as string | undefined,
    pageSize: params.pageSize as string | undefined,
  };
  return expenseFilterSchema.parse(raw);
}
