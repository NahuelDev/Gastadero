import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Expense, DebtEdge } from "@gastos/shared";
import { fromCents, formatCurrency } from "@gastos/shared";
import i18n from "../i18n/index.js";

export function generateReport(
  groupName: string,
  expenses: Expense[],
  debts: DebtEdge[],
  currency = "ARS"
) {
  const doc = new jsPDF();
  const t = i18n.t;

  // Title
  doc.setFontSize(18);
  doc.text(`${t("expenses.title")}: ${groupName}`, 14, 20);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString(), 14, 28);

  // Expenses table
  const expenseRows = expenses.map((e) => [
    new Date(e.createdAt).toLocaleDateString(),
    e.description ?? "-",
    e.paidByName,
    formatCurrency(e.amount, currency),
  ]);

  autoTable(doc, {
    startY: 35,
    head: [
      [
        "Fecha",
        t("expenses.description"),
        t("expenses.paidBy"),
        t("expenses.amount"),
      ],
    ],
    body: expenseRows,
  });

  // Debts summary
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY ?? 100;

  if (debts.length > 0) {
    doc.setFontSize(14);
    doc.text(t("balances.title"), 14, finalY + 15);

    const debtRows = debts.map((d) => [
      d.fromName,
      `${t("balances.owes")} ${formatCurrency(d.amount, currency)} ${t("balances.to")} ${d.toName}`,
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [["", ""]],
      body: debtRows,
      showHead: false,
    });
  }

  // Total
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const lastY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? finalY + 30;
  doc.setFontSize(12);
  doc.text(`Total: ${formatCurrency(total, currency)}`, 14, lastY + 10);

  doc.save(`Reporte_${groupName}.pdf`);
}
