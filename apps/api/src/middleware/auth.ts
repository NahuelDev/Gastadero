import { createMiddleware } from "hono/factory";
import type { Env } from "../index.js";
import { verifyJwt } from "../lib/jwt.js";

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const token = header.slice(7);
    const payload = await verifyJwt(token, c.env.JWT_SECRET);
    c.set("userId", payload.sub);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});
