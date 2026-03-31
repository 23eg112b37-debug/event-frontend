import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { loginUser, setBasicAuth } from "../api/api"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await loginUser({ username, password })
      setBasicAuth(username, password)
      login(data)
      navigate("/events")
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.card} className="fade-up">
        <div style={s.topBar} />
        <div style={s.iconBox}>◈</div>
        <h1 style={s.title}>Welcome Back</h1>
        <p style={s.sub}>Sign in to your EventHub account</p>

        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              required
              style={s.input}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={s.input}
            />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={s.footer}>
          No account?{" "}
          <Link to="/register" style={s.link}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page:     { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" },
  orb1:     { position: "fixed", top: "-15%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(184,71,255,0.12),transparent 70%)", pointerEvents: "none" },
  orb2:     { position: "fixed", bottom: "-15%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(71,232,255,0.1),transparent 70%)", pointerEvents: "none" },
  card:     { width: "100%", maxWidth: 420, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-xl)", padding: "44px 40px", display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1, overflow: "hidden" },
  topBar:   { position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,var(--neon2),var(--neon3))" },
  iconBox:  { width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,var(--neon2),var(--neon3))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800 },
  title:    { fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800 },
  sub:      { color: "var(--muted)", fontSize: 14, marginTop: -12 },
  form:     { display: "flex", flexDirection: "column", gap: 16 },
  field:    { display: "flex", flexDirection: "column", gap: 8 },
  label:    { fontSize: 11, fontWeight: 700, color: "var(--muted2)", letterSpacing: "0.1em" },
  input:    { background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: "12px 16px", color: "var(--text)", fontSize: 14 },
  btn:      { marginTop: 4, padding: 14, background: "linear-gradient(135deg,var(--neon2),var(--neon3))", color: "#fff", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-head)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(184,71,255,0.4)" },
  errorBox: { background: "rgba(255,79,106,0.08)", border: "1px solid rgba(255,79,106,0.25)", color: "var(--danger)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13 },
  footer:   { textAlign: "center", fontSize: 13, color: "var(--muted)" },
  link:     { color: "var(--neon1)", fontWeight: 700 },
}
