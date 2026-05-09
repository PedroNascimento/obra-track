import { NextRequest } from "next/server";
import { updateCategorySchema } from "@/application/dtos/category.dto";
import { makeContainer } from "@/lib/container";
import { ok, noContent, unauthorized, notFound, conflict, handleApiError } from "@/lib/api";
import { Category } from "@/domain/entities";

type Params = { params: { id: string } };

// PUT /api/categories/:id
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const { id } = params;
    const body = await req.json();
    const dto = updateCategorySchema.parse(body);

    const { categoryRepository } = makeContainer();

    const existing = await categoryRepository.findById(id, userId);
    if (!existing) return notFound("Categoria não encontrada.");

    if (dto.name && dto.name !== existing.name) {
      const nameExists = await categoryRepository.nameExistsForUser(dto.name, userId, id);
      if (nameExists) return conflict(`Categoria "${dto.name}" já existe.`);
    }

    const updated = Category.create({
      id: existing.id,
      userId: existing.userId,
      name: dto.name ?? existing.name,
      color: dto.color ?? existing.color,
      createdAt: existing.createdAt,
    });

    const saved = await categoryRepository.update(updated);
    return ok({ category: saved.toJSON() });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/categories/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const { id } = params;
    const { categoryRepository } = makeContainer();

    const existing = await categoryRepository.findById(id, userId);
    if (!existing) return notFound("Categoria não encontrada.");

    await categoryRepository.delete(id, userId);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
