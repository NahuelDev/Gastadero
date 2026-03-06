import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as groupsApi from "../api/groups.api.js";
import type { CreateGroupRequest, AddMemberRequest } from "@gastos/shared";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.fetchGroups,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => groupsApi.fetchGroup(id),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupRequest) => groupsApi.createGroup(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useAddMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemberRequest) =>
      groupsApi.addMember(groupId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group", groupId] }),
  });
}
