import { sql } from "drizzle-orm";
import type { Database } from "../db/client.js";

interface RawBalance {
  member_id: string;
  display_name: string;
  net_balance: number;
}

export async function getGroupBalances(db: Database, groupId: string) {
  const result = await db.all<RawBalance>(sql`
    SELECT
      b.member_id,
      gm.display_name,
      SUM(b.paid) - SUM(b.owed) as net_balance
    FROM (
      SELECT paid_by_member_id as member_id, amount as paid, 0 as owed
      FROM expenses WHERE group_id = ${groupId}
      UNION ALL
      SELECT es.member_id, 0 as paid, es.amount as owed
      FROM expense_splits es
      INNER JOIN expenses e ON es.expense_id = e.id
      WHERE e.group_id = ${groupId}
      UNION ALL
      SELECT from_member_id as member_id, 0 as paid, amount as owed
      FROM settlements WHERE group_id = ${groupId}
      UNION ALL
      SELECT to_member_id as member_id, amount as paid, 0 as owed
      FROM settlements WHERE group_id = ${groupId}
    ) b
    INNER JOIN group_members gm ON b.member_id = gm.id
    GROUP BY b.member_id
    HAVING net_balance != 0
  `);

  return result.map((r) => ({
    memberId: r.member_id,
    displayName: r.display_name,
    netBalance: r.net_balance,
  }));
}
