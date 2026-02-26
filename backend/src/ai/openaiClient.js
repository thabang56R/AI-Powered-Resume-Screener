import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

export function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim().length === 0) return null;
  return new OpenAI({ apiKey: key });
}