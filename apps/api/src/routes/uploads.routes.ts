import { Hono } from "hono";
import type { Env } from "../index.js";
import { authMiddleware } from "../middleware/auth.js";
import { generateUploadKey } from "../services/upload.service.js";
import { badRequest } from "../lib/errors.js";

export const uploadRoutes = new Hono<Env>();

uploadRoutes.use("*", authMiddleware);

// Direct upload endpoint: client PUTs the file here, worker proxies to R2
uploadRoutes.put("/receipt", async (c) => {
  const groupId = c.req.query("groupId");
  const filename = c.req.query("filename") ?? "receipt.jpg";

  if (!groupId) throw badRequest("groupId is required");

  const key = generateUploadKey(groupId, filename);
  const body = await c.req.arrayBuffer();
  const contentType =
    c.req.header("Content-Type") ?? "application/octet-stream";

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
