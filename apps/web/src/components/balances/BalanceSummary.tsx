import { useTranslation } from "react-i18next";
import { formatCurrency } from "@gastos/shared";
import type { DebtEdge } from "@gastos/shared";
import { WhatsAppShareButton } from "./WhatsAppShareButton.js";

export function BalanceSummary({
  debts,
  groupName,
  currency,
}: {
  debts: DebtEdge[];
  groupName: string;
  currency: string;
}) {
  const { t } = useTranslation();

  if (!debts.length) {
    return (
      <div className="text-center py-8">
        <p className="text-primary font-medium">{t("balances.noDebts")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt, i) => (
        <div
          key={i}
          className="bg-surface p-4 rounded-xl shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-text-main">
              <span className="font-medium">{debt.fromName}</span>{" "}
              {t("balances.owes")}{" "}
              <span className="font-semibold text-primary">
                {formatCurrency(debt.amount, currency)}
              </span>{" "}
              {t("balances.to")}{" "}
              <span className="font-medium">{debt.toName}</span>
            </p>
          </div>
          <WhatsAppShareButton
            debtorName={debt.fromName}
            amount={debt.amount}
            groupName={groupName}
            currency={currency}
          />
        </div>
      ))}
    </div>
  );
}
