import { useTranslation } from "react-i18next";
import { formatCurrency } from "@gastos/shared";
import type { Settlement } from "@gastos/shared";

export function SettlementList({
  settlements,
  currency,
}: {
  settlements: Settlement[];
  currency: string;
}) {
  const { t } = useTranslation();

  if (!settlements.length) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">{t("settlements.noSettlements")}</p>
        <p className="text-text-muted text-xs mt-1">{t("settlements.noSettlementsHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {settlements.map((s) => (
        <div key={s.id} className="bg-surface p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-text-main">
            <span className="font-medium">{s.fromMemberName}</span> →{" "}
            <span className="font-medium">{s.toMemberName}</span>
          </p>
          <div className="flex justify-between mt-1">
            <span className="text-sm text-text-muted">
              {s.note ?? ""}
            </span>
            <span className="font-semibold text-primary">
              {formatCurrency(s.amount, currency)}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            {new Date(s.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
