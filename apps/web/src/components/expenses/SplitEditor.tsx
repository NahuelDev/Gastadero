import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { GroupMember, ExpenseSplit } from "@gastos/shared";
import { fromCents, toCents } from "@gastos/shared";

interface Split {
  memberId: string;
  amount: number; // in cents
}

export function SplitEditor({
  members,
  totalAmount,
  onChange,
  initialSplits,
}: {
  members: GroupMember[];
  totalAmount: number; // in cents
  onChange: (splits: Split[]) => void;
  initialSplits?: ExpenseSplit[];
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"equal" | "percentage" | "custom">(
    initialSplits ? "custom" : "equal"
  );
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    () => new Set(initialSplits?.map((s) => s.memberId) ?? members.map((m) => m.id))
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    () => {
      if (!initialSplits) return {};
      const map: Record<string, string> = {};
      for (const s of initialSplits) {
        map[s.memberId] = fromCents(s.amount).toString();
      }
      return map;
    }
  );
  const [percentages, setPercentages] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    const pct = Math.floor(100 / members.length);
    for (const m of members) map[m.id] = pct.toString();
    return map;
  });

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        if (next.size > 1) next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  // Equal split
  useEffect(() => {
    if (mode === "equal" && selectedMembers.size > 0 && totalAmount > 0) {
      const selected = members.filter((m) => selectedMembers.has(m.id));
      const perPerson = Math.floor(totalAmount / selected.length);
      const remainder = totalAmount - perPerson * selected.length;
      const splits = selected.map((m, i) => ({
        memberId: m.id,
        amount: perPerson + (i < remainder ? 1 : 0),
      }));
      onChange(splits);
    }
  }, [mode, selectedMembers, members, totalAmount, onChange]);

  // Percentage split
  useEffect(() => {
    if (mode === "percentage" && totalAmount > 0) {
      const splits = members
        .filter((m) => {
          const pct = parseFloat(percentages[m.id] || "0");
          return pct > 0;
        })
        .map((m) => ({
          memberId: m.id,
          amount: Math.round(totalAmount * (parseFloat(percentages[m.id] || "0") / 100)),
        }));
      onChange(splits);
    }
  }, [mode, percentages, members, totalAmount, onChange]);

  const handleCustomChange = (memberId: string, value: string) => {
    const updated = { ...customAmounts, [memberId]: value };
    setCustomAmounts(updated);

    const splits = members
      .filter((m) => updated[m.id] && parseFloat(updated[m.id]) > 0)
      .map((m) => ({
        memberId: m.id,
        amount: toCents(parseFloat(updated[m.id]) || 0),
      }));
    onChange(splits);
  };

  const handlePercentageChange = (memberId: string, value: string) => {
    setPercentages((prev) => ({ ...prev, [memberId]: value }));
  };

  const totalPct = Object.values(percentages).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("equal")}
          className={`flex-1 py-2 rounded-lg text-sm ${mode === "equal" ? "bg-primary text-white" : "border border-slate-300"}`}
        >
          {t("expenses.splitEqual")}
        </button>
        <button
          type="button"
          onClick={() => setMode("percentage")}
          className={`flex-1 py-2 rounded-lg text-sm ${mode === "percentage" ? "bg-primary text-white" : "border border-slate-300"}`}
        >
          {t("expenses.splitPercent")}
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`flex-1 py-2 rounded-lg text-sm ${mode === "custom" ? "bg-primary text-white" : "border border-slate-300"}`}
        >
          {t("expenses.splitCustom")}
        </button>
      </div>

      {mode === "equal" && (
        <div className="space-y-2">
          {members.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedMembers.has(member.id)}
                onChange={() => toggleMember(member.id)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-main">
                {member.displayName}
              </span>
            </label>
          ))}
          {totalAmount > 0 && selectedMembers.size > 0 && (
            <p className="text-sm text-text-muted">
              {fromCents(Math.floor(totalAmount / selectedMembers.size)).toFixed(2)} c/u
            </p>
          )}
        </div>
      )}

      {mode === "percentage" && (
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <span className="text-sm text-text-main flex-1">
                {member.displayName}
              </span>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                placeholder="0"
                value={percentages[member.id] ?? ""}
                onChange={(e) =>
                  handlePercentageChange(member.id, e.target.value)
                }
                className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-text-muted">%</span>
            </div>
          ))}
          <p className={`text-sm ${Math.abs(totalPct - 100) < 0.01 ? "text-text-muted" : "text-danger"}`}>
            Total: {totalPct}%
          </p>
        </div>
      )}

      {mode === "custom" && (
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <span className="text-sm text-text-main flex-1">
                {member.displayName}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={customAmounts[member.id] ?? ""}
                onChange={(e) =>
                  handleCustomChange(member.id, e.target.value)
                }
                className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          {totalAmount > 0 && (() => {
            const customTotal = Object.values(customAmounts).reduce(
              (sum, v) => sum + (parseFloat(v) || 0), 0
            );
            const expected = fromCents(totalAmount);
            return (
              <p className={`text-sm ${Math.abs(customTotal - expected) < 0.01 ? "text-text-muted" : "text-danger"}`}>
                Total: {customTotal.toFixed(2)} / {expected.toFixed(2)}
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}
