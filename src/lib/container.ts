import { PrismaExpenseRepository } from "@/infrastructure/repositories/prisma-expense.repository";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user.repository";
import { PrismaCategoryRepository } from "@/infrastructure/repositories/prisma-category.repository";
import { CreateExpenseUseCase } from "@/domain/use-cases/create-expense.use-case";
import { UpdateExpenseUseCase } from "@/domain/use-cases/update-expense.use-case";
import { DeleteExpenseUseCase } from "@/domain/use-cases/delete-expense.use-case";
import { GetExpensesUseCase } from "@/domain/use-cases/get-expenses.use-case";
import { GetFinancialSummaryUseCase } from "@/domain/use-cases/get-financial-summary.use-case";
import { RegisterUserUseCase } from "@/domain/use-cases/register-user.use-case";
import { LoginUserUseCase } from "@/domain/use-cases/login-user.use-case";

// =============================================================
// Container de Injeção de Dependência
// Instancia repositórios e wires use cases — serverless safe
// (cada request cria um novo container, sem estado global)
// =============================================================

export function makeContainer() {
  // ─── Repositórios ─────────────────────────────────────────
  const expenseRepository = new PrismaExpenseRepository();
  const userRepository = new PrismaUserRepository();
  const categoryRepository = new PrismaCategoryRepository();

  // ─── Use Cases ────────────────────────────────────────────
  return {
    // Repositórios (expostos para casos especiais)
    expenseRepository,
    userRepository,
    categoryRepository,

    // Expenses
    createExpense: new CreateExpenseUseCase(expenseRepository),
    updateExpense: new UpdateExpenseUseCase(expenseRepository),
    deleteExpense: new DeleteExpenseUseCase(expenseRepository),
    getExpenses: new GetExpensesUseCase(expenseRepository),
    getFinancialSummary: new GetFinancialSummaryUseCase(expenseRepository),

    // Auth
    registerUser: new RegisterUserUseCase(userRepository),
    loginUser: new LoginUserUseCase(userRepository),
  };
}

export type Container = ReturnType<typeof makeContainer>;
