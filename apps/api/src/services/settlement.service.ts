import { eq, desc } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { settlements, groupMembers } from "../db/schema.js";

export async function createSettlement(
  db: Database,
  groupId: string,
  fromMemberId: string,
  toMemberId: string,
  amount: number,
  note?: string
) {
  const id = crypto.randomUUID();
  await db.insert(settlements).values({
    id,
    groupId,
    fromMemberId,
    toMemberId,
    amount,
    note: note ?? null,
  });
  return { id };
}

export async function listSettlements(db: Database, groupId: string) {
  const rows = await db
    .select({
      id: settlements.id,
      groupId: settlements.groupId,
      fromMemberId: settlements.fromMemberId,
      toMemberId: settlements.toMemberId,
      amount: settlements.amount,
      note: settlements.note,
      createdAt: settlements.createdAt,
    })
    .from(settlements)
    .where(eq(settlements.groupId, groupId))
    .orderBy(desc(settlements.createdAt));

  const memberIds = new Set(rows.flatMap((r) => [r.fromMemberId, r.toMemberId]));
  const memberMap: Record<string, string> = {};
  for (const memberId of memberIds) {
    const member = await db
      .select({ displayName: groupMembers.displayName })
      .from(groupMembers)
      .where(eq(groupMembers.id, memberId))
      .get();
    if (member) memberMap[memberId] = member.displayName;
  }

  return rows.map((r) => ({
    ...r,
    fromMemberName: memberMap[r.fromMemberId] ?? "Unknown",
    toMemberName: memberMap[r.toMemberId] ?? "Unknown",
  }));
}
