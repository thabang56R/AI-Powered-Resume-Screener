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
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? "*",
    credentials: true
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/evaluate", evaluateRoutes);
app.use("/api/evaluate", evaluateBatchRoutes);
app.use("/api/audit", auditRoutes);

const PORT = process.env.PORT || 8080;

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => console.log(`✅ Server listening on ${PORT}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});