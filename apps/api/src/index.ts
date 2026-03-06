import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth.routes.js";
import { groupRoutes } from "./routes/groups.routes.js";
import { expenseRoutes } from "./routes/expenses.routes.js";
import { balanceRoutes } from "./routes/balances.routes.js";
import { settlementRoutes } from "./routes/settlements.routes.js";
import { uploadRoutes } from "./routes/uploads.routes.js";
import { AppError } from "./lib/errors.js";

export type Env = {
  Bindings: {
    DB: D1Database;
    RECEIPTS: R2Bucket;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
};

const app = new Hono<Env>();

app.use(
  "*",
  cors({
    origin: "https://gastadero.nahuelclotet.com.ar",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.route("/auth", authRoutes);
app.route("/groups", groupRoutes);
app.route("/expenses", expenseRoutes);
app.route("/balances", balanceRoutes);
app.route("/settlements", settlementRoutes);
app.route("/uploads", uploadRoutes);

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode as 400);
  }
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
