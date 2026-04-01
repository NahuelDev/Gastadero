import { eq, and, isNull, gt } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { users, passwordResetTokens } from "../db/schema.js";
import { hashPassword, verifyPassword, sha256Hex } from "../lib/password.js";
import { signJwt } from "../lib/jwt.js";
import { badRequest, unauthorized } from "../lib/errors.js";
import { sendPasswordResetEmail } from "../lib/email.js";

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

export async function requestPasswordReset(
  db: Database,
  email: string,
  resendApiKey: string,
  appUrl: string
) {
  const successResponse = {
    message: "If an account exists with that email, a reset link has been sent",
  };

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) return successResponse;

  // Rate limit: skip if a token was created in the last 60 seconds
  const recentToken = await db
    .select({ id: passwordResetTokens.id })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        gt(
          passwordResetTokens.createdAt,
          new Date(Date.now() - 60_000).toISOString()
        )
      )
    )
    .get();

  if (recentToken) return successResponse;

  // Generate secure token
  const rawBytes = crypto.getRandomValues(new Uint8Array(32));
  const rawToken = Array.from(rawBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const tokenHash = await sha256Hex(rawToken);

  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 3_600_000).toISOString(); // 1 hour

  await db.insert(passwordResetTokens).values({
    id,
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(resendApiKey, email, resetUrl);

  return successResponse;
}

export async function resetPassword(
  db: Database,
  token: string,
  newPassword: string
) {
  const tokenHash = await sha256Hex(token);

  const resetToken = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date().toISOString())
      )
    )
    .get();

  if (!resetToken) throw badRequest("Invalid or expired token");

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, resetToken.userId));

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date().toISOString() })
    .where(eq(passwordResetTokens.id, resetToken.id));

  return { message: "Password updated successfully" };
}
