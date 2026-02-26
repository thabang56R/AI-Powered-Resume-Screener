# AI Resume Screener (MERN + OpenAI + Evidence + Audit Trail)

An enterprise-style AI-powered resume screening system built with:

- MongoDB
- Express.js
- React (Vite)
- Node.js
- OpenAI API

## 🚀 Features

### AI Evaluation
- Match score (0–100)
- Matched & missing skills
- Strengths & risks
- Improvement suggestions
- Interview questions

### 🔎 Evidence-Based Scoring
Each matched skill includes extracted evidence snippets from the resume text.
No blind AI scoring — results are grounded in real resume content.

### 📊 Batch Screening
- Evaluate multiple resumes at once
- Ranked shortlist table
- Recruiter workflow ready

### 🧾 Recruiter Panel
- Candidate status tracking:
  - New
  - Shortlisted
  - Interview
  - Rejected
  - Hired
- Internal notes per candidate

### 🔐 Audit Trail
Every change (status or notes) is logged with:
- Who made the change
- What changed
- When it happened
- Before/After snapshot

Enterprise-level transparency and accountability.

---

## 🛠️ Tech Stack

Frontend:
- React + Vite
- React Router
- Custom UI

Backend:
- Express.js
- MongoDB (Mongoose)
- OpenAI API
- Zod validation
- Rate limiting
- Audit logging

---

## 📦 Setup

### Backend

cd backend
npm install
npm run dev


Required `.env`:

PORT=8080
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
CLIENT_ORIGIN=http://localhost:5173


### Frontend

cd client
npm install
npm run dev


---

## 🌍 Deployment
- Backend → Render
- Frontend → Vercel

---

## 🎯 Why This Project Stands Out

- Explainable AI scoring
- Evidence extraction from resume text
- Recruiter workflow design
- Audit trail system
- Robust error handling (quota, 429, etc.)
- Production-ready structure

---

## 📌 Author
Thabang Rakeng