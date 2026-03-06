import { eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signJwt } from "../lib/jwt.js";
import { badRequest, unauthorized } from "../lib/errors.js";

export async function register(
  db: Database,
  email: string,
  password: string,
  displayName: string,
  jwtSecret: string
) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) throw badRequest("Email already registered");

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({ id, email, passwordHash, displayName });

  const token = await signJwt(id, email, jwtSecret);
  return {
    token,
    user: { id, email, displayName, createdAt: new Date().toISOString() },
  };
}

export async function login(
  db: Database,
  email: string,
  password: string,
  jwtSecret: string
) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) throw unauthorized("Invalid credentials");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw unauthorized("Invalid credentials");

  const token = await signJwt(user.id, user.email, jwtSecret);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt!,
    },
  };
}
