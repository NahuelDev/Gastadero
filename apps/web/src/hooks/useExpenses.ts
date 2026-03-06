import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expensesApi from "../api/expenses.api.js";
import type { CreateExpenseRequest } from "@gastos/shared";

export function useExpenses(groupId: string) {
  return useQuery({
    queryKey: ["expenses", groupId],
    queryFn: () => expensesApi.fetchExpenses(groupId),
    enabled: !!groupId,
  });
}

export function useCreateExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expensesApi.createExpense(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", groupId] });
      qc.invalidateQueries({ queryKey: ["balances", groupId] });
    },
  });
}

export function useUpdateExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateExpenseRequest }) =>
      expensesApi.updateExpense(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", groupId] });
      qc.invalidateQueries({ queryKey: ["balances", groupId] });
    },
  });
}

export function useDeleteExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", groupId] });
      qc.invalidateQueries({ queryKey: ["balances", groupId] });
    },
  });
}
