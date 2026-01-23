import fetch from "node-fetch";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;


export const runAiAnalysis = async (resumeText, jobDescription) => {
  const prompt = `
You are an AI hiring assistant.

Analyze the following resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return structured JSON:
{
  "fitScore": number (0-100),
  "skills": ["skill1", "skill2"],
  "gaps": ["missing skill", "missing experience"],
  "rawAnalysis": "full text summary"
}
`;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();

  try {
    return JSON.parse(data.candidates[0].content[0].text.trim());
  } catch (err) {
    return { error: "Failed to parse AI response", raw: data };
  }
};

