export interface Group {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  inviteCode: string;
  createdByUserId: string;
  createdAt: string;
}

export interface GroupPreview {
  id: string;
  name: string;
  description: string | null;
  currency: string;
}

export interface GroupMember {
  id: string;
  userId: string | null;
  displayName: string;
  role: "admin" | "member";
  joinedAt: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  currency?: string;
}

export interface AddMemberRequest {
  displayName: string;
}
