import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import * as balancesApi from "../api/balances.api.js";
import { simplifyDebts } from "../lib/debt-simplification.js";

export function useBalances(groupId: string) {
  const query = useQuery({
    queryKey: ["balances", groupId],
    queryFn: () => balancesApi.fetchBalances(groupId),
    enabled: !!groupId,
  });

  const simplifiedDebts = useMemo(
    () => (query.data ? simplifyDebts(query.data) : []),
    [query.data]
  );

  return { ...query, simplifiedDebts };
}
