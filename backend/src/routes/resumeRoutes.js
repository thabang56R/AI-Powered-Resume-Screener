// src/routes/resumeRoutes.js
import express from 'express';
import { analyzeResume } from '../controllers/resumeController.js';
import Screening from '../models/Screening.js';

const router = express.Router();

// ────────────────────────────────────────────────
// POST /api/screen-resume   ← resume upload & analysis
// ────────────────────────────────────────────────
router.post('/screen-resume', ...analyzeResume);

// ────────────────────────────────────────────────
// GET /api/screenings       ← list recent results
// ────────────────────────────────────────────────
router.get('/screenings', async (req, res) => {
  try {
    const items = await Screening.find()
      .sort({ createdAt: -1 })     // newest first
      .limit(20)
      .lean();                     // faster, plain JS objects

    res.status(200).json(items);
  } catch (error) {
    console.error('GET /screenings error:', error);
    res.status(500).json({
      error: 'Failed to retrieve screening history',
      message: error.message,
    });
  }
});

// Optional: GET /api/screenings/:id  ← single result (for future detail view)
router.get('/screenings/:id', async (req, res) => {
  try {
    const item = await Screening.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ error: 'Screening not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;