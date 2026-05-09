import { NextRequest, NextResponse } from "next/server";
import { makeContainer } from "@/lib/container";
import { unauthorized, handleApiError, buildExpenseFilter } from "@/lib/api";
import { generateExpenseReportPDF } from "@/infrastructure/pdf/expense-report.generator";
import type { ExpenseReportItem } from "@/infrastructure/pdf/expense-report.generator";
import { ExpenseProps } from "@/domain/entities";

// GET /api/reports/pdf?period=monthly
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userName = req.headers.get("x-user-name") ?? "";
    const userEmail = req.headers.get("x-user-email") ?? "";
    if (!userId) return unauthorized();

    const filter = buildExpenseFilter(req.nextUrl.searchParams);
    const { getExpenses, getFinancialSummary, categoryRepository } = makeContainer();

    // Busca todas as despesas do período (sem paginação para o relatório)
    const [{ expenses }, { summary }, categories] = await Promise.all([
      getExpenses.execute({ userId, filter, page: 1, pageSize: 1000 }),
      getFinancialSummary.execute({ userId, filter }),
      categoryRepository.findAllByUser(userId),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const reportItems: ExpenseReportItem[] = expenses.map((e) => {
      const props = e.toJSON() as ExpenseProps;
      return {
        id: props.id,
        expenseDate: props.expenseDate,
        type: props.type,
        categoryName: props.categoryId ? (categoryMap.get(props.categoryId) ?? null) : null,
        description: props.description,
        amount: props.amount,
      };
    });

    const pdfBuffer = await generateExpenseReportPDF({
      userName,
      userEmail,
      summary,
      expenses: reportItems,
      generatedAt: new Date(),
    });

    const periodLabel = summary.periodLabel.replace(/[^a-zA-Z0-9\-]/g, "_");
    const filename = `ObraTrack_Relatorio_${periodLabel}_${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
