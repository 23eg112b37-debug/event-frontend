import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../api/api"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole]         = useState("USER")
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setLoading(true)
    try {
      await registerUser({ username, email, password, role })
      setSuccess("Account created! Redirecting to login...")
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.")
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
        <div style={s.iconBox}>✦</div>
        <h1 style={s.title}>Create Account</h1>
        <p style={s.sub}>Join EventHub — it is free</p>

        {error   && <div style={s.errorBox}>{error}</div>}
        {success && <div style={s.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>USERNAME</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="cool_username" required style={s.input} />
          </div>
          <div style={s.field}>
            <label style={s.label}>EMAIL</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={s.input} />
          </div>
          <div style={s.field}>
            <label style={s.label}>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 6 characters" required style={s.input} />
          </div>
          <div style={s.field}>
            <label style={s.label}>ACCOUNT TYPE</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={s.input}>
              <option value="USER">User — attend events</option>
              <option value="ADMIN">Admin — manage events</option>
            </select>
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Creating..." : "Create Account →"}
          </button>
        </form>

        <p style={s.footer}>
          Already have an account?{" "}
          <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page:       { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" },
  orb1:       { position: "fixed", top: "-15%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(71,232,255,0.1),transparent 70%)", pointerEvents: "none" },
  orb2:       { position: "fixed", bottom: "-15%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(71,255,156,0.08),transparent 70%)", pointerEvents: "none" },
  card:       { width: "100%", maxWidth: 440, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-xl)", padding: "44px 40px", display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1, overflow: "hidden" },
  topBar:     { position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,var(--neon3),var(--neon5))" },
  iconBox:    { width: 52, height: 52, borderRadius: 14, background: "var(--surface2)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--neon1)", fontSize: 22, fontWeight: 800 },
  title:      { fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800 },
  sub:        { color: "var(--muted)", fontSize: 14, marginTop: -12 },
  form:       { display: "flex", flexDirection: "column", gap: 16 },
  field:      { display: "flex", flexDirection: "column", gap: 8 },
  label:      { fontSize: 11, fontWeight: 700, color: "var(--muted2)", letterSpacing: "0.1em" },
  input:      { background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: "12px 16px", color: "var(--text)", fontSize: 14 },
  btn:        { marginTop: 4, padding: 14, background: "linear-gradient(135deg,var(--neon3),var(--neon5))", color: "#0a0a0f", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-head)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(71,232,255,0.3)" },
  errorBox:   { background: "rgba(255,79,106,0.08)", border: "1px solid rgba(255,79,106,0.25)", color: "var(--danger)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13 },
  successBox: { background: "rgba(71,255,156,0.08)", border: "1px solid rgba(71,255,156,0.25)", color: "var(--success)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13 },
  footer:     { textAlign: "center", fontSize: 13, color: "var(--muted)" },
  link:       { color: "var(--neon1)", fontWeight: 700 },
}
