import type { MemberBalance, DebtEdge } from "@gastos/shared";

export function simplifyDebts(balances: MemberBalance[]): DebtEdge[] {
  const creditors: { memberId: string; name: string; amount: number }[] = [];
  const debtors: { memberId: string; name: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.netBalance > 0) {
      creditors.push({
        memberId: b.memberId,
        name: b.displayName,
        amount: b.netBalance,
      });
    } else if (b.netBalance < 0) {
      debtors.push({
        memberId: b.memberId,
        name: b.displayName,
        amount: -b.netBalance,
      });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const edges: DebtEdge[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount);
    edges.push({
      from: debtors[di].memberId,
      fromName: debtors[di].name,
      to: creditors[ci].memberId,
      toName: creditors[ci].name,
      amount,
    });

    creditors[ci].amount -= amount;
    debtors[di].amount -= amount;

    if (creditors[ci].amount === 0) ci++;
    if (debtors[di].amount === 0) di++;
  }

  return edges;
}
