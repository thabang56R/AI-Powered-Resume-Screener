// client/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { clearToken } from "../lib/auth.js";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    mustHaveSkills: ""
  });

  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");

  // Upgrade 3: multi-select for batch screening
  const [selectedResumeIds, setSelectedResumeIds] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [err, setErr] = useState("");

  async function loadAll() {
    const [j, r, e] = await Promise.all([api("/api/jobs"), api("/api/resumes"), api("/api/evaluate")]);

    setJobs(j);
    setResumes(r);
    setEvaluations(e);

    if (!selectedJobId && j[0]) setSelectedJobId(j[0]._id);
    if (!selectedResumeId && r[0]) setSelectedResumeId(r[0]._id);

    // If user has not selected batch set yet, default to all resumes
    setSelectedResumeIds((prev) => (prev.length === 0 ? r.map((x) => x._id) : prev));
  }

  useEffect(() => {
    loadAll().catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rankedEvaluations = useMemo(() => {
    return evaluations
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [evaluations]);

  async function createJob(e) {
    e.preventDefault();
    setErr("");

    const mustHaveSkills = jobForm.mustHaveSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await api("/api/jobs", {
      method: "POST",
      body: { ...jobForm, mustHaveSkills }
    });

    setJobForm({ title: "", company: "", location: "", description: "", mustHaveSkills: "" });
    await loadAll();
  }

  async function uploadResume(file) {
    setErr("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await api("/api/resumes/upload", { method: "POST", body: form, isForm: true });
      await loadAll();
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function runEvaluationSingle() {
    setErr("");
    if (!selectedJobId || !selectedResumeId) return setErr("Select a job and a resume first.");
    setEvaluating(true);
    try {
      await api("/api/evaluate", { method: "POST", body: { jobId: selectedJobId, resumeId: selectedResumeId } });
      await loadAll();
    } catch (e) {
      setErr(e.message);
    } finally {
      setEvaluating(false);
    }
  }

  // Upgrade 3: batch screen
  async function runBatchEvaluation() {
    setErr("");
    if (!selectedJobId) return setErr("Select a job first.");
    const ids = selectedResumeIds.filter(Boolean);
    if (ids.length === 0) return setErr("Select at least 1 resume for batch screening.");

    setEvaluating(true);
    try {
      await api("/api/evaluate/batch", {
        method: "POST",
        body: { jobId: selectedJobId, resumeIds: ids, max: Math.min(10, ids.length) }
      });
      await loadAll();
    } catch (e) {
      setErr(e.message);
    } finally {
      setEvaluating(false);
    }
  }

  function toggleResumeId(id) {
    setSelectedResumeIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  function selectAllResumes() {
    setSelectedResumeIds(resumes.map((x) => x._id));
  }

  function clearAllResumes() {
    setSelectedResumeIds([]);
  }

  function logout() {
    clearToken();
    nav("/login");
  }

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Create jobs, upload resumes, screen with AI, and build a ranked shortlist.</p>
        </div>
        <button className="secondary" onClick={logout}>Logout</button>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="grid">
        {/* Create Job */}
        <div className="card">
          <h2>Create Job</h2>
          <form onSubmit={createJob} className="stack">
            <input
              placeholder="Job title"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
            />
            <input
              placeholder="Company"
              value={jobForm.company}
              onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
            />
            <input
              placeholder="Location"
              value={jobForm.location}
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
            />
            <textarea
              placeholder="Job description (paste full JD)"
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              rows={7}
            />
            <input
              placeholder="Must-have skills (comma separated)"
              value={jobForm.mustHaveSkills}
              onChange={(e) => setJobForm({ ...jobForm, mustHaveSkills: e.target.value })}
            />
            <button>Create</button>
          </form>
        </div>

        {/* Upload + Single Evaluation + Batch Evaluation */}
        <div className="card">
          <h2>Upload Resume</h2>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])}
            disabled={uploading}
          />
          <p className="muted">{uploading ? "Uploading..." : "PDF/DOCX only (max 2MB)."}</p>

          <hr />

          <h2>Run AI Evaluation (Single)</h2>

          <label>Job</label>
          <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
            <option value="">-- choose --</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} {j.company ? `@ ${j.company}` : ""}
              </option>
            ))}
          </select>

          <label>Resume</label>
          <select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)}>
            <option value="">-- choose --</option>
            {resumes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.originalName}
              </option>
            ))}
          </select>

          <button onClick={runEvaluationSingle} disabled={evaluating}>
            {evaluating ? "Evaluating..." : "Evaluate (AI)"}
          </button>
          <p className="muted">Returns score, skills gaps, risks, and interview questions.</p>

          <hr />

          {/* Upgrade 3: Batch Screening */}
          <h2>Batch Screen (Top 10)</h2>
          <p className="muted">
            Select multiple resumes, then generate a ranked shortlist table. Great for recruiters.
          </p>

          <div className="batchActions">
            <button className="secondary" onClick={selectAllResumes} type="button">Select all</button>
            <button className="secondary" onClick={clearAllResumes} type="button">Clear</button>
          </div>

          <div className="batchList">
            {resumes.length === 0 ? (
              <p className="muted">Upload resumes to enable batch screening.</p>
            ) : (
              resumes.map((r) => (
                <label key={r._id} className="batchItem">
                  <input
                    type="checkbox"
                    checked={selectedResumeIds.includes(r._id)}
                    onChange={() => toggleResumeId(r._id)}
                  />
                  <span>{r.originalName}</span>
                </label>
              ))
            )}
          </div>

          <button onClick={runBatchEvaluation} disabled={evaluating || !selectedJobId || selectedResumeIds.length === 0}>
            {evaluating ? "Screening..." : `Screen ${Math.min(10, selectedResumeIds.length)} Resumes`}
          </button>
          <p className="muted">
            Tip: If you hit OpenAI quota limits, the endpoint will return a clean error (no server crash).
          </p>
        </div>

        {/* Upgrade 3: Ranked shortlist table */}
        <div className="card">
          <h2>Ranked Shortlist</h2>
          <p className="muted">Sorted by score. Click “View” to open the evaluation and manage status/notes.</p>

          {rankedEvaluations.length === 0 ? (
            <p className="muted">No evaluations yet.</p>
          ) : (
            <div className="table">
              <div className="thead">
                <div>Score</div>
                <div>Status</div>
                <div>Strength</div>
                <div>Missing</div>
                <div>Open</div>
              </div>

              {rankedEvaluations.slice(0, 20).map((ev) => (
                <div className="trow" key={ev._id}>
                  <div className="big">{ev.score}/100</div>
                  <div className="pill">{ev.status || "new"}</div>
                  <div className="muted">{(ev.strengths?.[0] || "—").slice(0, 70)}</div>
                  <div className="muted">{ev.missingSkills?.length ? ev.missingSkills.slice(0, 2).join(", ") : "—"}</div>
                  <div>
                    <Link className="pill" to={`/evaluations/${ev._id}`}>View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr />

          <h3 className="muted">How to use this Ai-Powered Resume Screener</h3>
         <p>This application helps recruiters screen and rank candidates efficiently using AI-assisted analysis with explainable results</p>
          <ul>
            <li>Create a Job- Start by creating a job listing , Add the job title , Company, Location , Full description , and any must have skills (like a real recruiter workflow).</li>
            <li>Upload Resumes- Upload candidate resumes in PDF or DOCX format. The system extracts and processes the resume text automatically.</li>
            <li>Run AI Evaluation- Select a job and a resum(or use batch screening). The system will generate a matched score(0-100)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}