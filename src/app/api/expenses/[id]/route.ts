import { NextRequest } from "next/server";
import { updateExpenseSchema } from "@/application/dtos/update-expense.dto";
import { makeContainer } from "@/lib/container";
import { ok, noContent, unauthorized, notFound, handleApiError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// GET /api/expenses/:id
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const { id } = await params;
    const { expenseRepository } = makeContainer();
    const expense = await expenseRepository.findById(id, userId);
    if (!expense) return notFound("Despesa não encontrada.");

    return ok({ expense: expense.toJSON() });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/expenses/:id
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const dto = updateExpenseSchema.parse(body);

    const { updateExpense } = makeContainer();
    const { expense } = await updateExpense.execute({
      id,
      userId,
      type: dto.type,
      categoryId: dto.categoryId,
      description: dto.description,
      amount: dto.amount,
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
    });

    return ok({ expense: expense.toJSON() });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/expenses/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const { id } = await params;
    const { deleteExpense } = makeContainer();
    await deleteExpense.execute({ id, userId });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
