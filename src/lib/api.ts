import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyJWT, AUTH_COOKIE_NAME, JWTPayload } from "@/application/services/auth.service";
import { ExpenseFilter } from "@/domain/types";
import { expenseFilterSchema } from "@/application/dtos/expense-filter.dto";

// =============================================================
// Helpers para API Routes
// =============================================================

// ─── Resposta padronizada ─────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, errors?: unknown) {
  return NextResponse.json({ error: { message, errors } }, { status: 400 });
}

export function unauthorized(message = "Não autorizado.") {
  return NextResponse.json({ error: { message } }, { status: 401 });
}

export function forbidden(message = "Sem permissão.") {
  return NextResponse.json({ error: { message } }, { status: 403 });
}

export function notFound(message = "Recurso não encontrado.") {
  return NextResponse.json({ error: { message } }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ error: { message } }, { status: 409 });
}

export function serverError(message = "Erro interno do servidor.") {
  return NextResponse.json({ error: { message } }, { status: 500 });
}

// ─── Tratamento de erros ──────────────────────────────────────

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return badRequest("Dados inválidos.", error.flatten().fieldErrors);
  }

  if (error instanceof Error) {
    // Erros do domínio (entidade/use case) retornam 400
    return badRequest(error.message);
  }

  console.error("[API] Unexpected error:", error);
  return serverError();
}

// ─── Autenticação ─────────────────────────────────────────────

export async function getAuthenticatedUser(
  req: NextRequest
): Promise<JWTPayload | null> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function requireAuth(req: NextRequest): Promise<JWTPayload> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    throw new Response(JSON.stringify({ error: { message: "Não autorizado." } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

// ─── Conversor de filtro ──────────────────────────────────────

export function buildExpenseFilter(searchParams: URLSearchParams): ExpenseFilter {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => { raw[key] = value; });

  const parsed = expenseFilterSchema.parse(raw);

  return {
    period: parsed.period,
    dateRange:
      parsed.period === "custom" && parsed.from && parsed.to
        ? {
            from: new Date(parsed.from),
            to: new Date(`${parsed.to}T23:59:59.999Z`),
          }
        : undefined,
  };
}

export function getPagination(searchParams: URLSearchParams) {
  const raw: Record<string, string> = {};
  searchParams.forEach((v, k) => { raw[k] = v; });
  const parsed = expenseFilterSchema.parse(raw);
  return { page: parsed.page, pageSize: parsed.pageSize };
}
