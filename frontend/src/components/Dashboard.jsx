import React,{useState} from 'react'; import axios from 'axios';
export default function Dashboard(){ const [id,setId]=useState(''); const [candidate,setCandidate]=useState(null); const [err,setErr]=useState('');
  const fetchCandidate = async ()=>{ try{ const res = await axios.get('/api/candidate/'+id); setCandidate(res.data); setErr(''); }catch(e){ setErr('Fetch failed: '+ (e.response?.data?.error || e.message)); } }
  return (
    <div>
      <div style={{display:'flex',gap:8}}>
        <input placeholder="Candidate ID" value={id} onChange={e=>setId(e.target.value)} />
        <button onClick={fetchCandidate}>Fetch</button>
      </div>
      {err && <div style={{color:'#b91c1c'}}>{err}</div>}
      {candidate && (
        <div className="candidateCard">
          <h3>{candidate.name}</h3>
          <p>Fit Score: {candidate.analysis?.fitScore ?? 'pending'}</p>
          <p>Skills: {(candidate.analysis?.skills||[]).join(', ')}</p>
          <p>Gaps: {(candidate.analysis?.gaps||[]).join(', ')}</p>
          <details><summary>Raw Report</summary><pre>{JSON.stringify(candidate.analysis?.rawReport || {}, null, 2)}</pre></details>
        </div>
      )}
    </div>
  );
}
