import { formatCurrency } from "@gastos/shared";
import i18n from "../i18n/index.js";

export function shareViaWhatsApp(
  debtorName: string,
  amount: number,
  groupName: string,
  currency = "ARS"
) {
  const formattedAmount = formatCurrency(amount, currency);

  const messages: Record<string, string> = {
    es: `Hola ${debtorName}! Para dejar en cero los gastos del grupo "${groupName}", me deberias transferir ${formattedAmount}. Avisame cuando lo pases!`,
    en: `Hi ${debtorName}! To settle up for the group "${groupName}", you owe me ${formattedAmount}. Let me know when you transfer it!`,
  };

  const message = messages[i18n.language] ?? messages.es;

  if (navigator.share) {
    navigator.share({ title: groupName, text: message });
  } else {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }
}
