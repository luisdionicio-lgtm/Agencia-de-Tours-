import cors from "cors";
import express from "express";
import type { Request } from "express";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { createRateLimiter, securityHeaders } from "./middlewares/security";
import { routes } from "./routes";

export const app = express();

app.disable("x-powered-by");
if (env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(createRateLimiter({ windowMs: 60_000, max: 120 }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({
  limit: "1mb",
  verify: (req, _res, buf) => {
    (req as Request).rawBody = buf.toString("utf8");
  }
}));
app.use(morgan("dev"));
app.use("/api", routes);
app.use(errorHandler);
