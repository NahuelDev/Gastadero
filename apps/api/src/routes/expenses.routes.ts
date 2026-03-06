import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createExpenseSchema } from "@gastos/shared";
import type { Env } from "../index.js";
import { authMiddleware } from "../middleware/auth.js";
import { createDb } from "../db/client.js";
import * as expenseService from "../services/expense.service.js";

export const expenseRoutes = new Hono<Env>();

expenseRoutes.use("*", authMiddleware);

expenseRoutes.post("/", zValidator("json", createExpenseSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb(c.env.DB);
  const result = await expenseService.createExpense(db, data);
  return c.json(result, 201);
});

expenseRoutes.get("/group/:groupId", async (c) => {
  const db = createDb(c.env.DB);
  const limit = parseInt(c.req.query("limit") ?? "50");
  const offset = parseInt(c.req.query("offset") ?? "0");
  const expenses = await expenseService.listExpenses(
    db,
    c.req.param("groupId"),
    limit,
    offset
  );
  return c.json(expenses);
});

expenseRoutes.put("/:id", zValidator("json", createExpenseSchema), async (c) => {
  const data = c.req.valid("json");
  const db = createDb(c.env.DB);
  const result = await expenseService.updateExpense(db, c.req.param("id"), data);
  return c.json(result);
});

expenseRoutes.delete("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const result = await expenseService.deleteExpense(
    db,
    c.req.param("id"),
    c.get("userId")
  );
  return c.json(result);
});
