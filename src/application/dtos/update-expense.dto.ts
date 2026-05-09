import { z } from "zod";
import { createExpenseSchema } from "./create-expense.dto";

// Todos os campos são opcionais no update (PATCH)
export const updateExpenseSchema = createExpenseSchema.partial();

export type UpdateExpenseDTO = z.infer<typeof updateExpenseSchema>;
