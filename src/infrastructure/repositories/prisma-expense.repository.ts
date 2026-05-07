import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client";
import { Expense } from "@/domain/entities";
import {
  IExpenseRepository,
  FinancialSummary,
  ExpenseSummaryByType,
  ExpenseSummaryByCategory,
  TimelineEntry,
} from "@/domain/repositories";
import { ExpenseFilter, ExpenseType } from "@/domain/types";
import { mapPrismaExpenseToDomain } from "./prisma-mapper";

// =============================================================
// Implementação concreta: IExpenseRepository com Prisma
// Todos os queries filtram por userId (Row-Level Isolation)
// =============================================================

function buildDateFilter(filter: ExpenseFilter): { gte?: Date; lte?: Date } | undefined {
  const now = new Date();

  if (filter.period === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // início da semana (domingo)
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (filter.period === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (filter.period === "custom" && filter.dateRange) {
    return { gte: filter.dateRange.from, lte: filter.dateRange.to };
  }

  return undefined; // "total" = sem filtro de data
}

function buildPeriodLabel(filter: ExpenseFilter): string {
  if (filter.period === "weekly") return "Esta semana";
  if (filter.period === "monthly") {
    const now = new Date();
    return now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }
  if (filter.period === "custom" && filter.dateRange) {
    const from = filter.dateRange.from.toLocaleDateString("pt-BR");
    const to = filter.dateRange.to.toLocaleDateString("pt-BR");
    return `${from} – ${to}`;
  }
  return "Todo o período";
}

export class PrismaExpenseRepository implements IExpenseRepository {

  async create(expense: Expense): Promise<Expense> {
    const record = await prisma.expense.create({
      data: {
        id: expense.id,
        userId: expense.userId,
        type: expense.type,
        categoryId: expense.categoryId ?? null,
        description: expense.description,
        amount: new Prisma.Decimal(expense.amount),
        expenseDate: expense.expenseDate,
      },
    });
    return mapPrismaExpenseToDomain(record);
  }

  async findById(id: string, userId: string): Promise<Expense | null> {
    const record = await prisma.expense.findFirst({
      where: { id, userId },
    });
    return record ? mapPrismaExpenseToDomain(record) : null;
  }

  async findByFilter(
    userId: string,
    filter: ExpenseFilter,
    options?: { skip?: number; take?: number }
  ): Promise<Expense[]> {
    const dateFilter = buildDateFilter(filter);
    const records = await prisma.expense.findMany({
      where: {
        userId,
        ...(dateFilter ? { expenseDate: dateFilter } : {}),
      },
      orderBy: { expenseDate: "desc" },
      skip: options?.skip ?? 0,
      take: options?.take ?? 20,
    });
    return records.map(mapPrismaExpenseToDomain);
  }

  async countByFilter(userId: string, filter: ExpenseFilter): Promise<number> {
    const dateFilter = buildDateFilter(filter);
    return prisma.expense.count({
      where: {
        userId,
        ...(dateFilter ? { expenseDate: dateFilter } : {}),
      },
    });
  }

  async update(expense: Expense): Promise<Expense> {
    const record = await prisma.expense.update({
      where: { id: expense.id },
      data: {
        type: expense.type,
        categoryId: expense.categoryId ?? null,
        description: expense.description,
        amount: new Prisma.Decimal(expense.amount),
        expenseDate: expense.expenseDate,
      },
    });
    return mapPrismaExpenseToDomain(record);
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.expense.deleteMany({
      where: { id, userId }, // deleteMany para garantir userId sem lançar exceção se não existir
    });
  }

  async getSummary(userId: string, filter: ExpenseFilter): Promise<FinancialSummary> {
    const dateFilter = buildDateFilter(filter);
    const whereClause = {
      userId,
      ...(dateFilter ? { expenseDate: dateFilter } : {}),
    };

    // ─── Executa todas as agregações em paralelo ────────────
    const [totalResult, byTypeRaw, byCategoryRaw, timelineRaw] = await Promise.all([
      // Total geral
      prisma.expense.aggregate({
        where: whereClause,
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Por tipo
      prisma.expense.groupBy({
        by: ["type"],
        where: whereClause,
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Por categoria (inclui despesas sem categoria)
      prisma.expense.findMany({
        where: whereClause,
        select: {
          categoryId: true,
          amount: true,
          category: {
            select: { name: true, color: true },
          },
        },
      }),

      // Timeline: despesas agrupadas por dia
      prisma.expense.findMany({
        where: whereClause,
        select: { expenseDate: true, amount: true },
        orderBy: { expenseDate: "asc" },
      }),
    ]);

    // ─── Processar por tipo ──────────────────────────────────
    const byType: ExpenseSummaryByType[] = byTypeRaw.map((row) => ({
      type: row.type as ExpenseType,
      total: Number(row._sum.amount ?? 0),
      count: row._count.id,
    }));

    // ─── Processar por categoria ─────────────────────────────
    const categoryMap = new Map<
      string,
      { name: string | null; color: string | null; total: number; count: number }
    >();

    for (const row of byCategoryRaw) {
      const key = row.categoryId ?? "__none__";
      const existing = categoryMap.get(key);
      const amount = Number(row.amount);
      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        categoryMap.set(key, {
          name: row.category?.name ?? null,
          color: row.category?.color ?? null,
          total: amount,
          count: 1,
        });
      }
    }

    const byCategory: ExpenseSummaryByCategory[] = Array.from(categoryMap.entries()).map(
      ([key, val]) => ({
        categoryId: key === "__none__" ? null : key,
        categoryName: val.name,
        categoryColor: val.color,
        total: val.total,
        count: val.count,
      })
    );

    // ─── Processar timeline (agrupado por dia) ────────────────
    const timelineMap = new Map<string, number>();
    for (const row of timelineRaw) {
      const dateKey = row.expenseDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
      timelineMap.set(dateKey, (timelineMap.get(dateKey) ?? 0) + Number(row.amount));
    }
    const timeline: TimelineEntry[] = Array.from(timelineMap.entries()).map(
      ([date, total]) => ({ date, total })
    );

    return {
      totalAmount: Number(totalResult._sum.amount ?? 0),
      totalCount: totalResult._count.id,
      byType,
      byCategory,
      timeline,
      periodLabel: buildPeriodLabel(filter),
    };
  }
}
