import { api } from "./client.js";
import type {
  Group,
  GroupPreview,
  GroupWithMembers,
  CreateGroupRequest,
  AddMemberRequest,
} from "@gastos/shared";

export function fetchGroups(): Promise<Group[]> {
  return api<Group[]>("/groups");
}

export function fetchGroup(id: string): Promise<GroupWithMembers> {
  return api<GroupWithMembers>(`/groups/${id}`);
}

export function createGroup(data: CreateGroupRequest): Promise<Group> {
  return api<Group>("/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function addMember(
  groupId: string,
  data: AddMemberRequest
): Promise<{ id: string; displayName: string }> {
  return api<{ id: string; displayName: string }>(`/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchGroupByInviteCode(code: string): Promise<GroupPreview> {
  return api<GroupPreview>(`/groups/invite/${code}`);
}

export function fetchUnclaimedMembers(
  code: string
): Promise<{ id: string; displayName: string }[]> {
  return api<{ id: string; displayName: string }[]>(
    `/groups/invite/${code}/unclaimed`
  );
}

export function claimMember(
  code: string,
  memberId: string
): Promise<{ groupId: string }> {
  return api<{ groupId: string }>(`/groups/claim/${code}`, {
    method: "POST",
    body: JSON.stringify({ memberId }),
  });
}
