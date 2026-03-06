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
      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover whitespace-nowrap"
    >
      {t("balances.shareWhatsApp")}
    </button>
  );
}
