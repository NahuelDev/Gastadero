import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@gastos/shared";
import type { DebtEdge, MemberBalance } from "@gastos/shared";

export function GroupSummary({
  groupName,
  debts,
  balances,
  currency,
}: {
  groupName: string;
  debts: DebtEdge[];
  balances: MemberBalance[];
  currency: string;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const buildMessage = () => {
    const lines: string[] = [`*${groupName}*`, ""];

    if (debts.length > 0) {
      lines.push("*Deudas*");
      for (const d of debts) {
        lines.push(
          `${d.fromName} debe a ${d.toName}: ${formatCurrency(d.amount, currency)}`
        );
      }
      lines.push("");
    }

    if (balances.length > 0) {
      lines.push("*Balances*");
      for (const b of balances) {
        const sign = b.netBalance >= 0 ? "+" : "-";
        lines.push(
          `${b.displayName}: ${sign}${formatCurrency(Math.abs(b.netBalance), currency)}`
        );
      }
    }

    return lines.join("\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildMessage()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (debts.length === 0 && balances.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={handleCopy}
        className="w-full border border-slate-200 rounded-lg p-3 text-sm text-text-muted hover:bg-background"
      >
        {copied ? t("groups.linkCopied") : t("expenses.copySummary")}
      </button>
      <pre className="mt-2 bg-background rounded-lg p-3 text-xs text-text-muted whitespace-pre-wrap">
        {buildMessage()}
      </pre>
    </div>
  );
}
