import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toCents, fromCents } from "@gastos/shared";
import type { GroupMember, Expense } from "@gastos/shared";
import { useCreateExpense, useUpdateExpense } from "../../hooks/useExpenses.js";
import { SplitEditor } from "./SplitEditor.js";
import { ReceiptUpload } from "./ReceiptUpload.js";

export function AddExpenseForm({
  groupId,
  members,
  currentMemberId,
  expense,
  onDone,
}: {
  groupId: string;
  members: GroupMember[];
  currentMemberId?: string;
  expense?: Expense;
  onDone?: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createExpense = useCreateExpense(groupId);
  const updateExpense = useUpdateExpense(groupId);
  const isEdit = !!expense;

  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(
    expense ? fromCents(expense.amount).toString() : ""
  );
  const [paidByMemberId, setPaidByMemberId] = useState(
    expense?.paidByMemberId ?? currentMemberId ?? members[0]?.id ?? ""
  );
  const [splits, setSplits] = useState<{ memberId: string; amount: number }[]>(
    expense?.splits ?? []
  );
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(
    expense?.receiptUrl ?? undefined
  );
  const [error, setError] = useState("");

  const amountCents = toCents(parseFloat(amount) || 0);

  const handleSplitsChange = useCallback(
    (newSplits: { memberId: string; amount: number }[]) => {
      setSplits(newSplits);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const splitsTotal = splits.reduce((sum, s) => sum + s.amount, 0);
    if (splitsTotal !== amountCents) {
      setError(t("expenses.splitMismatch"));
      return;
    }

    const payload = {
      groupId,
      description: description || undefined,
      amount: amountCents,
      paidByMemberId,
      splits,
      receiptUrl,
    };

    try {
      if (isEdit) {
        await updateExpense.mutateAsync({ id: expense.id, data: payload });
        onDone?.();
      } else {
        await createExpense.mutateAsync(payload);
        navigate(`/groups/${groupId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const isPending = isEdit ? updateExpense.isPending : createExpense.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t("expenses.description")}
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t("expenses.amount")}
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t("expenses.paidBy")}
        </label>
        <select
          value={paidByMemberId}
          onChange={(e) => setPaidByMemberId(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName}
            </option>
          ))}
        </select>
      </div>

      <SplitEditor
        members={members}
        totalAmount={amountCents}
        onChange={handleSplitsChange}
        initialSplits={expense?.splits}
      />

      <ReceiptUpload groupId={groupId} onUploaded={setReceiptUrl} />

      <div className="flex gap-2">
        {isEdit && (
          <button
            type="button"
            onClick={onDone}
            className="flex-1 border border-slate-300 py-2 rounded-lg hover:bg-slate-50"
          >
            {t("common.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className={`${isEdit ? "flex-1" : "w-full"} bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50`}
        >
          {isPending ? t("common.loading") : t("common.save")}
        </button>
      </div>
    </form>
  );
}
