import { NextRequest } from "next/server";
import { makeContainer } from "@/lib/container";
import { ok, unauthorized, handleApiError, buildExpenseFilter } from "@/lib/api";

// GET /api/expenses/summary?period=monthly
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const filter = buildExpenseFilter(req.nextUrl.searchParams);

    const { getFinancialSummary } = makeContainer();
    const { summary } = await getFinancialSummary.execute({ userId, filter });

    return ok({ summary });
  } catch (error) {
    return handleApiError(error);
  }
}
