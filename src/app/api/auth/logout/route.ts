import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/application/services/auth.service";
import { ok } from "@/lib/api";

// POST /api/auth/logout
export async function POST() {
  const response = ok({ message: "Logout realizado com sucesso." });
  response.cookies.set(AUTH_COOKIE_NAME, "", getAuthCookieOptions(true));
  return response;
}
