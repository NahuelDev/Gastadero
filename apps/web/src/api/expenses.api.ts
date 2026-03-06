import { api } from "./client.js";
import type { Expense, CreateExpenseRequest } from "@gastos/shared";

export function fetchExpenses(
  groupId: string,
  limit = 50,
  offset = 0
): Promise<Expense[]> {
  return api<Expense[]>(
    `/expenses/group/${groupId}?limit=${limit}&offset=${offset}`
  );
}

export function createExpense(
  data: CreateExpenseRequest
): Promise<{ id: string }> {
  return api<{ id: string }>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateExpense(
  id: string,
  data: CreateExpenseRequest
): Promise<{ id: string }> {
  return api<{ id: string }>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteExpense(id: string): Promise<{ success: boolean }> {
  return api<{ success: boolean }>(`/expenses/${id}`, { method: "DELETE" });
}
