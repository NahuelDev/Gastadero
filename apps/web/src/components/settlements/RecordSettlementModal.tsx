import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toCents } from "@gastos/shared";
import type { GroupMember } from "@gastos/shared";
import { useCreateSettlement } from "../../hooks/useSettlements.js";

export function RecordSettlementModal({
  groupId,
  members,
  currentMemberId,
  onClose,
}: {
  groupId: string;
  members: GroupMember[];
  currentMemberId?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const createSettlement = useCreateSettlement(groupId);
  const [fromMemberId, setFromMemberId] = useState(currentMemberId ?? members[0]?.id ?? "");
  const [toMemberId, setToMemberId] = useState(
    members.find((m) => m.id !== (currentMemberId ?? members[0]?.id))?.id ?? ""
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);

  // Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent same member in from/to
  useEffect(() => {
    if (fromMemberId === toMemberId) {
      const other = members.find((m) => m.id !== fromMemberId);
      if (other) setToMemberId(other.id);
    }
  }, [fromMemberId, members, toMemberId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSettlement.mutateAsync({
      groupId,
      fromMemberId,
      toMemberId,
      amount: toCents(parseFloat(amount) || 0),
      note: note || undefined,
    });
    setSuccess(true);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-8">
            <p className="text-primary font-medium text-lg">
              {t("common.saved")}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">
              {t("settlements.record")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  {t("settlements.from")}
                </label>
                <select
                  value={fromMemberId}
                  onChange={(e) => setFromMemberId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  {t("settlements.to")}
                </label>
                <select
                  value={toMemberId}
                  onChange={(e) => setToMemberId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {members
                    .filter((m) => m.id !== fromMemberId)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  {t("settlements.amount")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  {t("settlements.note")}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-slate-300 py-2 rounded-lg hover:bg-background"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createSettlement.isPending}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
