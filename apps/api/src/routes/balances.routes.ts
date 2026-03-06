import { Hono } from "hono";
import type { Env } from "../index.js";
import { authMiddleware } from "../middleware/auth.js";
import { createDb } from "../db/client.js";
import * as balanceService from "../services/balance.service.js";
import { assertGroupMembership } from "../services/group.service.js";

export const balanceRoutes = new Hono<Env>();

balanceRoutes.use("*", authMiddleware);

balanceRoutes.get("/group/:groupId", async (c) => {
  const db = createDb(c.env.DB);
  await assertGroupMembership(db, c.get("userId"), c.req.param("groupId"));
  const balances = await balanceService.getGroupBalances(
    db,
    c.req.param("groupId")
  );
  return c.json(balances);
});
