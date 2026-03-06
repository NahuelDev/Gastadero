import { Hono } from "hono";
import type { Env } from "../index.js";
import { authMiddleware } from "../middleware/auth.js";
import { createDb } from "../db/client.js";
import * as balanceService from "../services/balance.service.js";

export const balanceRoutes = new Hono<Env>();

balanceRoutes.use("*", authMiddleware);

balanceRoutes.get("/group/:groupId", async (c) => {
  const db = createDb(c.env.DB);
  const balances = await balanceService.getGroupBalances(
    db,
    c.req.param("groupId")
  );
  return c.json(balances);
});
