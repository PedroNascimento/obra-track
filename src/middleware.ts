import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, AUTH_COOKIE_NAME } from "@/application/services/auth.service";

// =============================================================
// Middleware Next.js — Proteção de rotas com JWT
// Rodando no Edge Runtime (por isso usamos jose, não jsonwebtoken)
// =============================================================

// Rotas públicas que não precisam de autenticação
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permite requisições para arquivos estáticos e imagens
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Verifica se é uma rota pública
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyJWT(token) : null;

  // Se está autenticado e tenta acessar rota de auth → redireciona para dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Se não está autenticado e tenta acessar rota privada
  if (!user && !isPublic) {
    // API routes retornam 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { message: "Não autorizado." } },
        { status: 401 }
      );
    }

    // Páginas redirecionam para login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Injeta userId no header para uso nas API Routes (evita re-verificar o JWT)
  if (user) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", user.sub);
    requestHeaders.set("x-user-email", user.email);
    requestHeaders.set("x-user-name", user.name);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  // Roda em todas as rotas exceto arquivos estáticos do Next.js
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
