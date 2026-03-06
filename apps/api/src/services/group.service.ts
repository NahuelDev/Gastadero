import { eq, and, isNull } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { groups, groupMembers, users } from "../db/schema.js";
import { notFound, badRequest } from "../lib/errors.js";

export async function listUserGroups(db: Database, userId: string) {
  return db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      currency: groups.currency,
      inviteCode: groups.inviteCode,
      createdByUserId: groups.createdByUserId,
      createdAt: groups.createdAt,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId));
}

export async function getGroupWithMembers(
  db: Database,
  groupId: string,
  userId: string
) {
  const membership = await db
    .select()
    .from(groupMembers)
    .where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
    )
    .get();

  if (!membership) throw notFound("Group not found");

  const group = await db
    .select()
    .from(groups)
    .where(eq(groups.id, groupId))
    .get();

  const members = await db
    .select({
      id: groupMembers.id,
      userId: groupMembers.userId,
      displayName: groupMembers.displayName,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  return { ...group!, members };
}

export async function createGroup(
  db: Database,
  userId: string,
  displayName: string,
  name: string,
  description?: string,
  currency = "ARS"
) {
  const groupId = crypto.randomUUID();
  const memberId = crypto.randomUUID();
  const inviteCode = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  await db.batch([
    db.insert(groups).values({
      id: groupId,
      name,
      description: description ?? null,
      currency,
      inviteCode,
      createdByUserId: userId,
    }),
    db.insert(groupMembers).values({
      id: memberId,
      groupId,
      userId,
      displayName,
      role: "admin",
    }),
  ]);

  return { id: groupId, name, description: description ?? null, currency, inviteCode };
}

export async function addMember(
  db: Database,
  groupId: string,
  displayName: string
) {
  const id = crypto.randomUUID();
  await db
    .insert(groupMembers)
    .values({ id, groupId, userId: null, displayName, role: "member" });
  return { id, displayName };
}

export async function getGroupByInviteCode(db: Database, code: string) {
  const group = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      currency: groups.currency,
    })
    .from(groups)
    .where(eq(groups.inviteCode, code))
    .get();

  if (!group) throw notFound("Invalid invite link");
  return group;
}

export async function getUnclaimedMembers(db: Database, code: string) {
  const group = await db
    .select({ id: groups.id })
    .from(groups)
    .where(eq(groups.inviteCode, code))
    .get();

  if (!group) throw notFound("Invalid invite link");

  return db
    .select({
      id: groupMembers.id,
      displayName: groupMembers.displayName,
    })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, group.id),
        isNull(groupMembers.userId)
      )
    );
}

export async function claimMember(
  db: Database,
  code: string,
  memberId: string,
  userId: string
) {
  const group = await db
    .select({ id: groups.id })
    .from(groups)
    .where(eq(groups.inviteCode, code))
    .get();

  if (!group) throw notFound("Invalid invite link");

  // Check user isn't already a member of this group
  const existing = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, group.id),
        eq(groupMembers.userId, userId)
      )
    )
    .get();

  if (existing) throw badRequest("You are already a member of this group");

  // Check the member slot exists and is unclaimed
  const member = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.id, memberId),
        eq(groupMembers.groupId, group.id),
        isNull(groupMembers.userId)
      )
    )
    .get();

  if (!member) throw badRequest("This member has already been claimed");

  // Get the user's display name to update the member nickname
  const user = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  await db
    .update(groupMembers)
    .set({ userId, displayName: user?.displayName ?? member.displayName })
    .where(eq(groupMembers.id, memberId));

  return { groupId: group.id };
}
