import { api } from "./client.js";
import type { MemberBalance } from "@gastos/shared";

export function fetchBalances(groupId: string): Promise<MemberBalance[]> {
  return api<MemberBalance[]>(`/balances/group/${groupId}`);
}
