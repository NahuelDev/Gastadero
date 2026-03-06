import { useTranslation } from "react-i18next";
import { shareViaWhatsApp } from "../../lib/whatsapp.js";

export function WhatsAppShareButton({
  debtorName,
  amount,
  groupName,
  currency,
}: {
  debtorName: string;
  amount: number;
  groupName: string;
  currency: string;
}) {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => shareViaWhatsApp(debtorName, amount, groupName, currency)}
      className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 whitespace-nowrap"
    >
      {t("balances.shareWhatsApp")}
    </button>
  );
}
