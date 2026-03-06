import { Hono } from "hono";
import type { Env } from "../index.js";
import { authMiddleware } from "../middleware/auth.js";
import { generateUploadKey } from "../services/upload.service.js";
import { badRequest } from "../lib/errors.js";
import { assertGroupMembership } from "../services/group.service.js";
import { createDb } from "../db/client.js";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadRoutes = new Hono<Env>();

uploadRoutes.use("*", authMiddleware);

// Direct upload endpoint: client PUTs the file here, worker proxies to R2
uploadRoutes.put("/receipt", async (c) => {
  const groupId = c.req.query("groupId");
  const filename = c.req.query("filename") ?? "receipt.jpg";

  if (!groupId) throw badRequest("groupId is required");

  const db = createDb(c.env.DB);
  await assertGroupMembership(db, c.get("userId"), groupId);

  const contentType = c.req.header("Content-Type") ?? "";
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw badRequest("File type not allowed. Use JPEG, PNG, WebP or PDF.");
  }

  const body = await c.req.arrayBuffer();
  if (body.byteLength > MAX_FILE_SIZE) {
    throw badRequest("File exceeds maximum allowed size of 5 MB.");
  }

  const key = generateUploadKey(groupId, filename);
  await c.env.RECEIPTS.put(key, body, {
    httpMetadata: { contentType },
  });

  return c.json({ url: key });
});

// Get a receipt image
uploadRoutes.get("/receipt/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const object = await c.env.RECEIPTS.get(key);

  if (!object) return c.json({ error: "Not found" }, 404);

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType ?? "image/jpeg"
  );
  headers.set("Cache-Control", "public, max-age=31536000");

  return new Response(object.body, { headers });
});
