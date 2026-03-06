import { api } from "./client.js";
import type { Settlement, CreateSettlementRequest } from "@gastos/shared";

export function fetchSettlements(groupId: string): Promise<Settlement[]> {
  return api<Settlement[]>(`/settlements/group/${groupId}`);
}

export function createSettlement(
  data: CreateSettlementRequest
): Promise<{ id: string }> {
  return api<{ id: string }>("/settlements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
