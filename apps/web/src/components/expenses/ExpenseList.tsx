import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatCurrency } from "@gastos/shared";
import type { Expense, GroupMember } from "@gastos/shared";
import { useDeleteExpense } from "../../hooks/useExpenses.js";
import { AddExpenseForm } from "./AddExpenseForm.js";

export function ExpenseList({
  expenses,
  groupId,
  currency,
  members,
  currentMemberId,
}: {
  expenses: Expense[];
  groupId: string;
  currency: string;
  members?: GroupMember[];
  currentMemberId?: string;
}) {
  const { t } = useTranslation();
  const deleteExpense = useDeleteExpense(groupId);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!expenses.length) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">{t("expenses.noExpenses")}</p>
        <Link
          to={`/groups/${groupId}/add`}
          className="inline-block mt-3 text-emerald-500 hover:underline text-sm font-medium"
        >
          {t("expenses.add")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) =>
        editingId === expense.id && members ? (
          <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm">
            <AddExpenseForm
              groupId={groupId}
              members={members}
              currentMemberId={currentMemberId}
              expense={expense}
              onDone={() => setEditingId(null)}
            />
          </div>
        ) : (
          <div
            key={expense.id}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-slate-800">
                {expense.description ?? "-"}
              </p>
              <p className="text-sm text-slate-500">
                {t("expenses.paidBy")}: {expense.paidByName}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(expense.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">
                {formatCurrency(expense.amount, currency)}
              </p>
              <div className="flex gap-2 mt-1 justify-end">
                {members && (
                  <button
                    onClick={() => setEditingId(expense.id)}
                    className="text-xs text-emerald-500 hover:underline"
                  >
                    {t("common.edit")}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm(t("expenses.confirmDelete"))) {
                      deleteExpense.mutate(expense.id);
                    }
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
