import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as settlementsApi from "../api/settlements.api.js";
import type { CreateSettlementRequest } from "@gastos/shared";

export function useSettlements(groupId: string) {
  return useQuery({
    queryKey: ["settlements", groupId],
    queryFn: () => settlementsApi.fetchSettlements(groupId),
    enabled: !!groupId,
  });
}

export function useCreateSettlement(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSettlementRequest) =>
      settlementsApi.createSettlement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settlements", groupId] });
      qc.invalidateQueries({ queryKey: ["balances", groupId] });
    },
  });
}
