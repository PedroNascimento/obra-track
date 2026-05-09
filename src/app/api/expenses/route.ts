import { NextRequest } from "next/server";
import { createExpenseSchema } from "@/application/dtos/create-expense.dto";
import { makeContainer } from "@/lib/container";
import { ok, created, unauthorized, handleApiError, buildExpenseFilter, getPagination } from "@/lib/api";

// GET /api/expenses?period=monthly&page=1&pageSize=20
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const searchParams = req.nextUrl.searchParams;
    const filter = buildExpenseFilter(searchParams);
    const { page, pageSize } = getPagination(searchParams);

    const { getExpenses } = makeContainer();
    const result = await getExpenses.execute({ userId, filter, page, pageSize });

    return ok({
      expenses: result.expenses.map((e) => e.toJSON()),
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/expenses
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const body = await req.json();
    const dto = createExpenseSchema.parse(body);

    const { createExpense } = makeContainer();
    const { expense } = await createExpense.execute({
      userId,
      type: dto.type,
      categoryId: dto.categoryId ?? null,
      description: dto.description,
      amount: dto.amount,
      expenseDate: new Date(dto.expenseDate),
    });

    return created({ expense: expense.toJSON() });
  } catch (error) {
    return handleApiError(error);
  }
}
