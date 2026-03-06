import { eq, desc } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { expenses, expenseSplits, groupMembers } from "../db/schema.js";
import { notFound } from "../lib/errors.js";
import type { CreateExpenseRequest } from "@gastos/shared";

export async function createExpense(db: Database, data: CreateExpenseRequest) {
  const expenseId = crypto.randomUUID();

  const insertExpense = db.insert(expenses).values({
    id: expenseId,
    groupId: data.groupId,
    paidByMemberId: data.paidByMemberId,
    amount: data.amount,
    description: data.description ?? null,
    receiptUrl: data.receiptUrl ?? null,
  });

  const insertSplits = data.splits.map((split) =>
    db.insert(expenseSplits).values({
      id: crypto.randomUUID(),
      expenseId,
      memberId: split.memberId,
      amount: split.amount,
    })
  );

  await db.batch([insertExpense, ...insertSplits]);

  return { id: expenseId };
}

export async function listExpenses(
  db: Database,
  groupId: string,
  limit = 50,
  offset = 0
) {
  const rows = await db
    .select({
      id: expenses.id,
      groupId: expenses.groupId,
      paidByMemberId: expenses.paidByMemberId,
      paidByName: groupMembers.displayName,
      amount: expenses.amount,
      description: expenses.description,
      receiptUrl: expenses.receiptUrl,
      createdAt: expenses.createdAt,
    })
    .from(expenses)
    .innerJoin(groupMembers, eq(expenses.paidByMemberId, groupMembers.id))
    .where(eq(expenses.groupId, groupId))
    .orderBy(desc(expenses.createdAt))
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) return [];

  // Fetch all splits for listed expenses
  const allSplits: Record<string, { memberId: string; amount: number }[]> = {};
  for (const row of rows) {
    const s = await db
      .select({ memberId: expenseSplits.memberId, amount: expenseSplits.amount })
      .from(expenseSplits)
      .where(eq(expenseSplits.expenseId, row.id));
    allSplits[row.id] = s;
  }

  return rows.map((row) => ({
    ...row,
    splits: allSplits[row.id] ?? [],
  }));
}

export async function updateExpense(db: Database, expenseId: string, data: CreateExpenseRequest) {
  const expense = await db
    .select()
    .from(expenses)
    .where(eq(expenses.id, expenseId))
    .get();

  if (!expense) throw notFound("Expense not found");

  const deleteOldSplits = db.delete(expenseSplits).where(eq(expenseSplits.expenseId, expenseId));
  const updateExp = db
    .update(expenses)
    .set({
      paidByMemberId: data.paidByMemberId,
      amount: data.amount,
      description: data.description ?? null,
      receiptUrl: data.receiptUrl ?? null,
    })
    .where(eq(expenses.id, expenseId));
  const insertSplits = data.splits.map((split) =>
    db.insert(expenseSplits).values({
      id: crypto.randomUUID(),
      expenseId,
      memberId: split.memberId,
      amount: split.amount,
    })
  );

  await db.batch([deleteOldSplits, updateExp, ...insertSplits]);
  return { id: expenseId };
}

export async function deleteExpense(
  db: Database,
  expenseId: string,
  _userId: string
) {
  const expense = await db
    .select()
    .from(expenses)
    .where(eq(expenses.id, expenseId))
    .get();

  if (!expense) throw notFound("Expense not found");

  await db.batch([
    db.delete(expenseSplits).where(eq(expenseSplits.expenseId, expenseId)),
    db.delete(expenses).where(eq(expenses.id, expenseId)),
  ]);

  return { success: true };
}
