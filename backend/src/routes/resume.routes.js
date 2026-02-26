import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import Resume from "../models/Resume.js";
import { extractTextFromBuffer } from "../utils/parseResume.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

router.get("/", requireAuth, async (req, res) => {
  const resumes = await Resume.find({ ownerId: req.user.sub })
    .select("-text")
    .sort({ createdAt: -1 });
  res.json(resumes);
});

router.get("/:id", requireAuth, async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!resume) return res.status(404).json({ error: "Not found" });
  res.json(resume);
});

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword"
  ];
  if (!allowed.includes(req.file.mimetype)) {
    return res.status(400).json({ error: "Unsupported type. Upload PDF/DOCX." });
  }

  const text = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);
  if (text.length < 200) {
    return res.status(400).json({ error: "Resume text too short / unreadable." });
  }

  const resume = await Resume.create({
    ownerId: req.user.sub,
    filename: `${Date.now()}_${req.file.originalname}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    text
  });

  res.json({ id: resume._id, originalName: resume.originalName, createdAt: resume.createdAt });
});

router.delete("/:id", requireAuth, async (req, res) => {
  await Resume.deleteOne({ _id: req.params.id, ownerId: req.user.sub });
  res.json({ ok: true });
});

export default router;