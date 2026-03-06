import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  currency: text("currency").notNull().default("ARS"),
  inviteCode: text("invite_code").notNull().unique(),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const groupMembers = sqliteTable(
  "group_members",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id),
    userId: text("user_id").references(() => users.id),
    displayName: text("display_name").notNull(),
    role: text("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
    joinedAt: text("joined_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("group_members_group_idx").on(t.groupId),
  ]
);

export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id),
    paidByMemberId: text("paid_by_member_id")
      .notNull()
      .references(() => groupMembers.id),
    amount: integer("amount").notNull(), // in cents
    description: text("description"),
    receiptUrl: text("receipt_url"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("expenses_group_idx").on(t.groupId)]
);

export const expenseSplits = sqliteTable(
  "expense_splits",
  {
    id: text("id").primaryKey(),
    expenseId: text("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => groupMembers.id),
    amount: integer("amount").notNull(), // in cents
  },
  (t) => [index("expense_splits_expense_idx").on(t.expenseId)]
);

export const settlements = sqliteTable(
  "settlements",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id),
    fromMemberId: text("from_member_id")
      .notNull()
      .references(() => groupMembers.id),
    toMemberId: text("to_member_id")
      .notNull()
      .references(() => groupMembers.id),
    amount: integer("amount").notNull(), // in cents
    note: text("note"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("settlements_group_idx").on(t.groupId)]
);
