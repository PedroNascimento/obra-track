import { describe, it, expect, vi } from "vitest";
import { CreateExpenseUseCase } from "@/domain/use-cases/create-expense.use-case";
import { IExpenseRepository } from "@/domain/repositories/expense.repository";

describe("CreateExpenseUseCase", () => {
  it("should create and persist an expense successfully", async () => {
    // Mock the repository
    const mockRepo: IExpenseRepository = {
      create: vi.fn().mockImplementation(async (expense) => expense),
      findById: vi.fn(),
      findByFilter: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getSummary: vi.fn(),
      countByFilter: vi.fn(),
    };

    const useCase = new CreateExpenseUseCase(mockRepo);

    const input = {
      userId: "user-123",
      type: "material" as const,
      description: "Cimento",
      amount: 50.0,
      expenseDate: new Date(),
    };

    const result = await useCase.execute(input);

    expect(result.expense).toBeDefined();
    expect(result.expense.description).toBe("Cimento");
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      description: "Cimento",
      amount: 50.0,
    }));
  });

  it("should throw an error if validation fails before hitting repository", async () => {
    const mockRepo: IExpenseRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByFilter: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getSummary: vi.fn(),
      countByFilter: vi.fn(),
    };

    const useCase = new CreateExpenseUseCase(mockRepo);

    const invalidInput = {
      userId: "user-123",
      type: "material" as const,
      description: "Cimento",
      amount: -10.0, // Invalid amount
      expenseDate: new Date(),
    };

    await expect(useCase.execute(invalidInput)).rejects.toThrow("O valor da despesa deve ser maior que zero.");
    
    // Ensure repository was never called
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
