import { NextRequest } from "next/server";
import { loginSchema } from "@/application/dtos/auth.dto";
import { comparePassword, signJWT, AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/application/services/auth.service";
import { makeContainer } from "@/lib/container";
import { ok, unauthorized, handleApiError } from "@/lib/api";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = loginSchema.parse(body);

    const { loginUser } = makeContainer();

    const { user } = await loginUser.execute({
      email: dto.email,
      plainPassword: dto.password,
      comparePassword,
    });

    const token = await signJWT({ sub: user.id, email: user.email, name: user.name });
    
    const response = ok({ user: user.toJSON() });
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Credenciais inválidas.") {
      return unauthorized(error.message);
    }
    return handleApiError(error);
  }
}
