import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";

function buildEvidenceMap(evidenceArr) {
  const map = new Map();
  (evidenceArr || []).forEach((e) => {
    if (!e || !e.skill) return;
    map.set(String(e.skill).toLowerCase(), Array.isArray(e.snippets) ? e.snippets : []);
  });
  return map;
}

function fmtWhen(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function EvaluationDetail() {
  const { id } = useParams();

  const [ev, setEv] = useState(null);
  const [audit, setAudit] = useState([]);
  const [err, setErr] = useState("");

  // Recruiter panel
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);

  async function loadEvaluation() {
    const data = await api(`/api/evaluate/${id}`);
    setEv(data);
    setStatus(data.status || "new");
    setNotes(data.notes || "");
  }

  async function loadAudit() {
    setLoadingAudit(true);
    try {
      const events = await api(`/api/audit?entityType=evaluation&entityId=${id}&limit=50`);
      setAudit(Array.isArray(events) ? events : []);
    } finally {
      setLoadingAudit(false);
    }
  }

  async function loadAll() {
    await loadEvaluation();
    await loadAudit();
  }

  useEffect(() => {
    loadAll().catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveRecruiterPanel() {
    setErr("");
    setSaving(true);
    try {
      const updated = await api(`/api/evaluate/${id}`, {
        method: "PATCH",
        body: { status, notes }
      });
      setEv(updated);
      // refresh audit after changes
      await loadAudit();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  const evidenceMap = useMemo(() => buildEvidenceMap(ev?.evidence), [ev]);

  if (err) return <div className="container"><div className="error">{err}</div></div>;
  if (!ev) return <div className="container"><p className="muted">Loading...</p></div>;

  const matchedSkills = Array.isArray(ev.matchedSkills) ? ev.matchedSkills : [];
  const missingSkills = Array.isArray(ev.missingSkills) ? ev.missingSkills : [];

  return (
    <div className="container">
      <Link to="/dashboard" className="muted">← Back</Link>
      <h1>Evaluation</h1>

      {/* Main AI report */}
      <div className="card">
        <div className="score">
          <div className="big">{ev.score}/100</div>
          <div className="pill">{ev.seniority || "unclear"}</div>
        </div>

        <p>{ev.summary}</p>

        <h3>Matched Skills (with Evidence)</h3>
        {matchedSkills.length === 0 ? (
          <p className="muted">No matched skills returned.</p>
        ) : (
          <div className="evidenceWrap">
            {matchedSkills.map((s) => {
              const snippets = evidenceMap.get(String(s).toLowerCase()) || [];
              return (
                <div key={s} className="evidenceCard">
                  <div className="evidenceHeader">
                    <span className="chip">{s}</span>
                    <span className="muted">
                      {snippets.length ? `${snippets.length} snippet(s)` : "no snippet found"}
                    </span>
                  </div>

                  {snippets.length > 0 ? (
                    <ul className="evidenceList">
                      {snippets.map((snip, i) => (
                        <li key={i} className="evidenceItem">“{snip}”</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted" style={{ marginTop: 8 }}>
                      No direct mentions found in extracted text. (Skill may be implied or formatted differently.)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h3>Missing Skills</h3>
        {missingSkills.length === 0 ? (
          <p className="muted">No missing skills returned.</p>
        ) : (
          <div className="chips">
            {missingSkills.map((s) => (
              <span key={s} className="chip warn">{s}</span>
            ))}
          </div>
        )}

        <h3>Strengths</h3>
        {ev.strengths?.length ? (
          <ul>{ev.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul>
        ) : (
          <p className="muted">—</p>
        )}

        <h3>Risks / Red Flags</h3>
        {ev.risks?.length ? (
          <ul>{ev.risks.map((x, i) => <li key={i}>{x}</li>)}</ul>
        ) : (
          <p className="muted">—</p>
        )}

        <h3>Improvements</h3>
        {ev.improvements?.length ? (
          <ul>{ev.improvements.map((x, i) => <li key={i}>{x}</li>)}</ul>
        ) : (
          <p className="muted">—</p>
        )}

        <h3>Interview Questions</h3>
        {ev.interviewQuestions?.length ? (
          <ul>{ev.interviewQuestions.map((x, i) => <li key={i}>{x}</li>)}</ul>
        ) : (
          <p className="muted">—</p>
        )}
      </div>

      {/* Recruiter Panel */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Recruiter Panel</h2>
        <p className="muted">Track hiring decisions with status + notes (like a real ATS).</p>

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="new">new</option>
          <option value="shortlisted">shortlisted</option>
          <option value="interview">interview</option>
          <option value="rejected">rejected</option>
          <option value="hired">hired</option>
        </select>

        <label>Notes</label>
        <textarea
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add recruiter notes: concerns, next steps, what to ask in interview..."
        />

        <div className="batchActions" style={{ marginTop: 10 }}>
          <button onClick={saveRecruiterPanel} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setStatus(ev.status || "new");
              setNotes(ev.notes || "");
            }}
            disabled={saving}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="topbar" style={{ padding: 0 }}>
          <div>
            <h2>Audit Trail</h2>
            <p className="muted">A tamper-evident history of changes (who/what/when).</p>
          </div>
          <button className="secondary" onClick={loadAudit} disabled={loadingAudit}>
            {loadingAudit ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {audit.length === 0 ? (
          <p className="muted">No audit events yet.</p>
        ) : (
          <div className="auditList">
            {audit.map((a) => (
              <div className="auditItem" key={a._id}>
                <div className="auditTop">
                  <div className="pill">{a.action}</div>
                  <div className="muted">{fmtWhen(a.createdAt)}</div>
                </div>

                <div className="muted">
                  {a.message || "—"}{" "}
                  {a.actor?.email ? <span>• by {a.actor.email}</span> : null}
                </div>

                <div className="auditDiff">
                  <div>
                    <div className="muted">Before</div>
                    <pre className="auditPre">{JSON.stringify(a.changes?.before || {}, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="muted">After</div>
                    <pre className="auditPre">{JSON.stringify(a.changes?.after || {}, null, 2)}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}