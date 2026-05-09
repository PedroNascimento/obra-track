import { describe, it, expect } from "vitest";
import { Expense } from "@/domain/entities/expense.entity";

describe("Expense Entity", () => {
  const validProps = {
    userId: "user-123",
    type: "material" as const,
    description: "Cimento",
    amount: 50.0,
    expenseDate: new Date(),
  };

  it("should create a valid expense", () => {
    const expense = Expense.create(validProps);
    expect(expense).toBeInstanceOf(Expense);
    expect(expense.userId).toBe(validProps.userId);
    expect(expense.type).toBe(validProps.type);
    expect(expense.description).toBe(validProps.description);
    expect(expense.amount).toBe(validProps.amount);
    expect(expense.id).toBeDefined();
    expect(expense.createdAt).toBeInstanceOf(Date);
  });

  it("should fail if amount is zero or negative", () => {
    expect(() => Expense.create({ ...validProps, amount: 0 })).toThrow("O valor da despesa deve ser maior que zero.");
    expect(() => Expense.create({ ...validProps, amount: -10 })).toThrow("O valor da despesa deve ser maior que zero.");
  });

  it("should fail if description is empty", () => {
    expect(() => Expense.create({ ...validProps, description: "   " })).toThrow("A descrição da despesa é obrigatória.");
    expect(() => Expense.create({ ...validProps, description: "" })).toThrow("A descrição da despesa é obrigatória.");
  });
});
