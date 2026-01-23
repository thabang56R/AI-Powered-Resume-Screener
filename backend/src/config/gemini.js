// src/config/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pre-create the model instance with desired config
export const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-8b',
  generationConfig: {
    temperature: 0.15,
    topP: 0.95,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json'
  }
});

export default genAI;