import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@gastos/shared";
import type { Env } from "../index.js";
import { createDb } from "../db/client.js";
import * as authService from "../services/auth.service.js";

export const authRoutes = new Hono<Env>();

authRoutes.post(
  "/register",
  zValidator("json", registerSchema),
  async (c) => {
    const { email, password, displayName } = c.req.valid("json");
    const db = createDb(c.env.DB);
    const result = await authService.register(
      db,
      email,
      password,
      displayName,
      c.env.JWT_SECRET
    );
    return c.json(result, 201);
  }
);

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const db = createDb(c.env.DB);
  const result = await authService.login(db, email, password, c.env.JWT_SECRET);
  return c.json(result);
});
