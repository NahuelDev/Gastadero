import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createSettlementSchema } from "@gastos/shared";
import type { Env } from "../index.js";
import { authMiddleware } from "../middleware/auth.js";
import { createDb } from "../db/client.js";
import * as settlementService from "../services/settlement.service.js";

export const settlementRoutes = new Hono<Env>();

settlementRoutes.use("*", authMiddleware);

settlementRoutes.post(
  "/",
  zValidator("json", createSettlementSchema),
  async (c) => {
    const { groupId, fromMemberId, toMemberId, amount, note } =
      c.req.valid("json");
    const db = createDb(c.env.DB);
    const result = await settlementService.createSettlement(
      db,
      groupId,
      fromMemberId,
      toMemberId,
      amount,
      note
    );
    return c.json(result, 201);
  }
);

settlementRoutes.get("/group/:groupId", async (c) => {
  const db = createDb(c.env.DB);
  const settlements = await settlementService.listSettlements(
    db,
    c.req.param("groupId")
  );
  return c.json(settlements);
});
