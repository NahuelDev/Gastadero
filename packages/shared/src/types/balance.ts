export interface MemberBalance {
  memberId: string;
  displayName: string;
  netBalance: number; // in cents, positive = owed money, negative = owes money
}

export interface DebtEdge {
  from: string; // debtor memberId
  fromName: string;
  to: string; // creditor memberId
  toName: string;
  amount: number; // in cents
}

export type SimplifiedDebts = DebtEdge[];
