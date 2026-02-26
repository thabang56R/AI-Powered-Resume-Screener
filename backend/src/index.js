import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import auditRoutes from "./routes/audit.routes.js";
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import evaluateRoutes from "./routes/evaluate.routes.js";
import evaluateBatchRoutes from "./routes/evaluate.batch.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (origin.endsWith(".vercel.app")) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

// Optional: nice home route (so / isn't 404)
app.get("/", (req, res) => {
  res.json({ name: "AI Resume Screener API", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/evaluate", evaluateRoutes);
app.use("/api/evaluate", evaluateBatchRoutes);
app.use("/api/audit", auditRoutes);

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  const PORT = Number(process.env.PORT) || 8080;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening on ${PORT}`);
  });
}

start().catch((e) => {
  console.error("❌ Failed to start server:", e);
  process.exit(1);
});