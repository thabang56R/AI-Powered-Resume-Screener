// backend/src/ai/evaluate.js
import { getOpenAIClient } from "./openaiClient.js";
import { buildEvidenceFromResume } from "../utils/evidence.js";

export async function evaluateResumeAgainstJob({ resumeText, job }) {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OPENAI_API_KEY is missing. Add it to backend/.env then restart.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const system = `
You are an ATS + senior recruiter assistant.
Be strict but fair. Do not invent facts.
Return ONLY valid JSON (no markdown).
Score 0-100.
Keys:
score, seniority, summary, matchedSkills, missingSkills, strengths, risks, improvements, interviewQuestions
Rules:
- matchedSkills/missingSkills: lowercase preferred, max 20 each.
- Keep arrays short and useful.
`;

  const user = `
JOB TITLE: ${job.title}
COMPANY: ${job.company || "N/A"}
LOCATION: ${job.location || "N/A"}

JOB DESCRIPTION:
${job.description}

MUST HAVE SKILLS:
${(job.mustHaveSkills || []).join(", ") || "N/A"}

RESUME TEXT:
${resumeText}
`;

  const resp = await openai.responses.create({
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    text: { format: { type: "json_object" } }
  });

  const rawText = resp.output_text || "{}";

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = {
      score: 0,
      seniority: "unclear",
      summary: "AI output could not be parsed.",
      matchedSkills: [],
      missingSkills: [],
      strengths: [],
      risks: [],
      improvements: [],
      interviewQuestions: []
    };
  }

  // score clamp
  const scoreNum = Number(parsed.score);
  parsed.score = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, Math.round(scoreNum))) : 0;

  // Evidence snippets: grounded in resume text (NOT AI-generated)
  const matched = Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [];
  parsed.evidence = buildEvidenceFromResume(resumeText, matched, 3);

  return { parsed, raw: resp };
}