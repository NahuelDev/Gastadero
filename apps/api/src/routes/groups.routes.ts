import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createGroupSchema, addMemberSchema } from "@gastos/shared";
import { eq } from "drizzle-orm";
import type { Env } from "../index.js";
import { authMiddleware } from "../middleware/auth.js";
import { createDb } from "../db/client.js";
import { users } from "../db/schema.js";
import * as groupService from "../services/group.service.js";

export const groupRoutes = new Hono<Env>();

// Public endpoints (no auth)
groupRoutes.get("/invite/:code", async (c) => {
  const db = createDb(c.env.DB);
  const group = await groupService.getGroupByInviteCode(
    db,
    c.req.param("code")
  );
  return c.json(group);
});

groupRoutes.get("/invite/:code/unclaimed", async (c) => {
  const db = createDb(c.env.DB);
  const members = await groupService.getUnclaimedMembers(
    db,
    c.req.param("code")
  );
  return c.json(members);
});

// Authenticated endpoints
groupRoutes.use("*", authMiddleware);

groupRoutes.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const groups = await groupService.listUserGroups(db, c.get("userId"));
  return c.json(groups);
});

groupRoutes.post("/", zValidator("json", createGroupSchema), async (c) => {
  const { name, description, currency } = c.req.valid("json");
  const db = createDb(c.env.DB);

  const user = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.id, c.get("userId")))
    .get();

  const group = await groupService.createGroup(
    db,
    c.get("userId"),
    user!.displayName,
    name,
    description,
    currency
  );
  return c.json(group, 201);
});

groupRoutes.get("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const group = await groupService.getGroupWithMembers(
    db,
    c.req.param("id"),
    c.get("userId")
  );
  return c.json(group);
});

groupRoutes.post(
  "/:id/members",
  zValidator("json", addMemberSchema),
  async (c) => {
    const { displayName } = c.req.valid("json");
    const db = createDb(c.env.DB);
    await groupService.assertGroupMembership(db, c.get("userId"), c.req.param("id"));
    const result = await groupService.addMember(
      db,
      c.req.param("id"),
      displayName
    );
    return c.json(result, 201);
  }
);

groupRoutes.post("/claim/:code", async (c) => {
  const { memberId } = await c.req.json<{ memberId: string }>();
  const db = createDb(c.env.DB);
  const result = await groupService.claimMember(
    db,
    c.req.param("code"),
    memberId,
    c.get("userId")
  );
  return c.json(result, 201);
});
