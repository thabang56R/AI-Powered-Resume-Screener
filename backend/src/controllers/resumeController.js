// src/controllers/resumeController.js

import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';
import Screening from '../models/Screening.js';
import genAI, { model as geminiModel } from '../config/gemini.js';  // ← corrected import

const upload = multer({ dest: 'uploads/' });

export const analyzeResume = [
  upload.single('resume'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No resume uploaded' });
      if (!req.body.jobDescription?.trim()) {
        return res.status(400).json({ error: 'Job description required' });
      }

      // Parse resume file
      const resumeText = await parseFile(req.file);
      await fs.unlink(req.file.path).catch(() => {});

      // Use the pre-configured model from gemini.js
      const model = geminiModel;  // ← no need to call getGenerativeModel again

      // Your prompt (keep as is or adjust)
      const prompt = createPrompt(resumeText, req.body.jobDescription);

      // Generate content
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let analysis;
      try {
        analysis = JSON.parse(text);
      } catch {
        return res.status(500).json({ error: 'AI returned invalid JSON format' });
      }

      // Save to database
      const screening = await Screening.create(analysis);

      res.json({
        ...analysis,
        id: screening._id.toString()
      });

    } catch (err) {
      console.error('Resume analysis error:', err);
      res.status(500).json({ 
        error: 'Analysis failed',
        message: err.message 
      });
    }
  }
];

// Your existing helper functions (parseFile, createPrompt)
async function parseFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const buffer = await fs.readFile(file.path);

  if (ext === '.pdf') {
    const { text } = await pdfParse(buffer);
    return text;
  }

  if (ext === '.docx') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  throw new Error('Only PDF and DOCX supported');
}

function createPrompt(resumeText, jobDesc) {
  return `
You are an expert recruiter.

Analyze resume vs job description.

Resume:
${resumeText.slice(0, 800000)}

Job:
${jobDesc}

Return only JSON:
{
  "matchPercentage": number,
  "strengths": string[],
  "weaknesses": string[],
  "skillsMatch": object,
  "feedback": string
}

Use <strong> in feedback for keywords.
`;
}