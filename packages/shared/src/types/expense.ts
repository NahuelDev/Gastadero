export interface ExpenseSplit {
  memberId: string;
  amount: number; // in cents
}

export interface Expense {
  id: string;
  groupId: string;
  paidByMemberId: string;
  paidByName: string;
  amount: number; // in cents
  description: string | null;
  receiptUrl: string | null;
  createdAt: string;
  splits: ExpenseSplit[];
}

export interface CreateExpenseRequest {
  groupId: string;
  description?: string;
  amount: number; // in cents
  paidByMemberId: string;
  splits: ExpenseSplit[];
  receiptUrl?: string;
}
