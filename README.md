# 🚀 AI Resume Screener  

![CI](https://github.com/thabang56R/AI-Powered-Resume-Screener/actions/workflows/ci.yml/badge.svg)  
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)  
![Node](https://img.shields.io/badge/Node.js-Express-brightgreen)  
![React](https://img.shields.io/badge/React-Vite-blue)  
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)  
![OpenAI](https://img.shields.io/badge/AI-OpenAI-black)  

An enterprise-style **AI-powered resume screening platform** built with the MERN stack and OpenAI, designed for explainable scoring, recruiter workflow management, and audit transparency.

---

## 🌐 Live Demo

Frontend:  
https://ai-powered-resume-screener-tau.vercel.app  

Backend API:  
https://ai-powerd-resume-screener.onrender.com  

> ⚠️ AI evaluation requires an active OpenAI API key with available quota.

---

## 🎬 Demo

![Demo](assets/demo.gif)

---

## 🧠 Problem Solved

Traditional resume screening:
- Is manual and time-consuming  
- Lacks transparency in scoring  
- Offers no structured recruiter workflow  
- Has no audit tracking  

This system introduces **explainable AI scoring + recruiter-grade workflow controls**.

---

## 🚀 Features

### 🔍 AI Evaluation
- Match score (0–100)  
- Seniority detection  
- Matched & missing skills  
- Strengths & risks analysis  
- Improvement suggestions  
- AI-generated interview questions  

### 🔎 Evidence-Based Scoring
Each matched skill includes extracted **evidence snippets** from the resume text.  
No black-box scoring. All results are grounded in real resume content.

### 📊 Batch Screening
- Evaluate multiple resumes at once  
- Ranked shortlist view  
- Recruiter workflow ready  

### 🧾 Recruiter Panel
Candidate status tracking:
- New  
- Shortlisted  
- Interview  
- Rejected  
- Hired  

Includes internal recruiter notes per candidate.

### 🔐 Audit Trail System
Every recruiter action is logged with:
- Who made the change  
- What changed  
- When it happened  
- Before/After snapshot  

Enterprise-level transparency and accountability.

---

## 🛠 Tech Stack

### Frontend
- React + Vite  
- React Router  
- Custom UI components  

### Backend
- Node.js + Express  
- MongoDB (Mongoose)  
- OpenAI API integration  
- Zod validation  
- Rate limiting  
- Secure JWT authentication  
- Audit logging system  

---

## 📦 Local Setup

### Backend
```
cd backend
npm install
npm run dev
```

Required `.env`:

```
PORT=8080
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend
```
cd frontend
npm install
npm run dev
```

---

## 🌍 Deployment

Backend → Render (Web Service)  
Frontend → Vercel (Static Deployment)  

Production-ready configuration:
- Proper port binding for cloud environments  
- Secure CORS configuration  
- Environment-based configuration  
- API quota error handling  

---

## 🎯 Why This Project Stands Out

- Explainable AI scoring (not black-box)  
- Evidence-grounded evaluations  
- Recruiter workflow system  
- Audit trail architecture  
- Batch screening support  
- Production deployment (Render + Vercel)  
- Robust error handling (quota, rate limiting, CORS)  
- Clean, scalable project structure  

---

## 👨‍💻 Author

**Thabang Rakeng**  
Full-Stack Developer | AI-Focused Backend Engineer  
