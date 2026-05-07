import { Expense as PrismaExpense, User as PrismaUser, Category as PrismaCategory } from "@prisma/client";
import { Expense, User, Category } from "@/domain/entities";
import { ExpenseType } from "@/domain/types";

// =============================================================
// Mappers: Prisma Record → Domain Entity
// Mantém a separação entre o modelo de banco e o domínio
// =============================================================

export function mapPrismaExpenseToDomain(record: PrismaExpense & { category?: PrismaCategory | null }): Expense {
  return Expense.reconstitute({
    id: record.id,
    userId: record.userId,
    type: record.type as ExpenseType,
    categoryId: record.categoryId ?? null,
    description: record.description,
    amount: Number(record.amount), // Prisma retorna Decimal, domínio usa number
    expenseDate: record.expenseDate,
    createdAt: record.createdAt,
  });
}

export function mapPrismaUserToDomain(record: PrismaUser): User {
  return User.reconstitute({
    id: record.id,
    name: record.name,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function mapPrismaCategoryToDomain(record: PrismaCategory): Category {
  return Category.reconstitute({
    id: record.id,
    userId: record.userId,
    name: record.name,
    color: record.color,
    createdAt: record.createdAt,
  });
}
