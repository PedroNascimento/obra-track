import { NextRequest } from "next/server";
import { createCategorySchema } from "@/application/dtos/category.dto";
import { makeContainer } from "@/lib/container";
import { ok, created, unauthorized, conflict, handleApiError } from "@/lib/api";
import { Category } from "@/domain/entities";
import { randomUUID } from "crypto";

// GET /api/categories
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const { categoryRepository } = makeContainer();
    const categories = await categoryRepository.findAllByUser(userId);

    return ok({ categories: categories.map((c) => c.toJSON()) });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const body = await req.json();
    const dto = createCategorySchema.parse(body);

    const { categoryRepository } = makeContainer();

    const nameExists = await categoryRepository.nameExistsForUser(dto.name, userId);
    if (nameExists) return conflict(`Categoria "${dto.name}" já existe.`);

    const category = Category.create({
      id: randomUUID(),
      userId,
      name: dto.name,
      color: dto.color,
    });

    const saved = await categoryRepository.create(category);
    return created({ category: saved.toJSON() });
  } catch (error) {
    return handleApiError(error);
  }
}
