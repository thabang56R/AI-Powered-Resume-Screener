import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { setToken } from "../lib/auth.js";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("recruiter");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: { name, email, password, role }
      });
      setToken(data.token);
      nav("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="container">
      <h1>Create account</h1>

      <form className="card" onSubmit={onSubmit}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="recruiter">Recruiter</option>
          <option value="candidate">Candidate</option>
        </select>

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {err && <div className="error">{err}</div>}

        <button>Create</button>
        <p className="muted">
          Have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}