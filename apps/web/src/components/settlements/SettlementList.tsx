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
        <p className="text-slate-500">{t("settlements.noSettlements")}</p>
        <p className="text-slate-400 text-xs mt-1">{t("settlements.noSettlementsHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {settlements.map((s) => (
        <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-slate-800">
            <span className="font-medium">{s.fromMemberName}</span> →{" "}
            <span className="font-medium">{s.toMemberName}</span>
          </p>
          <div className="flex justify-between mt-1">
            <span className="text-sm text-slate-500">
              {s.note ?? ""}
            </span>
            <span className="font-semibold text-emerald-600">
              {formatCurrency(s.amount, currency)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(s.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
