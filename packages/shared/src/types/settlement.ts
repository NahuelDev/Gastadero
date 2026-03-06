export interface Settlement {
  id: string;
  groupId: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number; // in cents
  note: string | null;
  createdAt: string;
}

export interface CreateSettlementRequest {
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number; // in cents
  note?: string;
}
