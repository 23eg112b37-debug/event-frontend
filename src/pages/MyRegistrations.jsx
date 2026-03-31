import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMyRegs, cancelReg } from "../api/api"
import { useAuth } from "../context/AuthContext"

const ACCENTS = ["var(--neon1)", "var(--neon2)", "var(--neon3)", "var(--neon4)", "var(--neon5)"]

export default function MyRegistrations() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [regs, setRegs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]         = useState({ type: "", text: "" })

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    getMyRegs(user.userId)
      .then(setRegs)
      .catch(() => setMsg({ type: "error", text: "Failed to load registrations." }))
      .finally(() => setLoading(false))
  }, [user])

  async function handleCancel(eventId) {
    if (!window.confirm("Cancel this registration?")) return
    try {
      await cancelReg(user.userId, eventId)
      setRegs((prev) => prev.map((r) => r.event && r.event.id === eventId ? { ...r, status: "CANCELLED" } : r))
      setMsg({ type: "success", text: "Registration cancelled." })
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Failed." })
    }
  }

  var confirmed = regs.filter((r) => r.status === "CONFIRMED")
  var cancelled = regs.filter((r) => r.status === "CANCELLED")

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={s.hero}>
        <div style={s.orb} />
        <div style={s.heroInner}>
          <h1 style={s.title}>My Tickets</h1>
          <p style={s.sub}>All your event registrations in one place</p>
          <div style={s.statsRow}>
            {[
              [confirmed.length, "Confirmed", "var(--neon5)", "rgba(71,255,156,0.1)", "rgba(71,255,156,0.25)"],
              [cancelled.length, "Cancelled", "var(--danger)", "rgba(255,79,106,0.1)", "rgba(255,79,106,0.25)"],
              [regs.length,      "Total",     "var(--neon2)", "rgba(184,71,255,0.1)", "rgba(184,71,255,0.25)"],
            ].map((item) => (
              <div key={item[1]} style={{ borderRadius: "var(--radius)", padding: "14px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: item[3], border: "1px solid " + item[4] }}>
                <span style={{ fontFamily: "var(--font-head)", fontSize: 30, fontWeight: 800, color: item[2] }}>{item[0]}</span>
                <span style={{ fontSize: 12, color: item[2] }}>{item[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.container}>
        {msg.text && (
          <div style={msg.type === "success" ? s.successBox : s.errorBox}>{msg.text}</div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 88, background: "var(--surface)", borderRadius: "var(--radius-lg)", animation: "pulse 1.4s infinite" }} />
            ))}
          </div>
        ) : regs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 56 }}>🎫</div>
            <p style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800 }}>No tickets yet</p>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>Register for events to see them here</p>
            <Link to="/events">
              <button style={s.browseBtn}>Browse Events</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {regs.map((reg, i) => {
              var event       = reg.event
              var date        = event ? new Date(event.eventDate) : null
              var isPast      = date && date < new Date()
              var isConfirmed = reg.status === "CONFIRMED"
              var accent      = ACCENTS[i % ACCENTS.length]

              return (
                <div key={reg.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", opacity: isConfirmed ? 1 : 0.6 }}>
                  <div style={{ width: 4, flexShrink: 0, background: isConfirmed ? accent : "var(--border)" }} />
                  <div style={{ flex: 1, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
                    {date && (
                      <div style={{ background: accent + "15", border: "1px solid " + accent + "30", borderRadius: 10, padding: "8px 12px", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, minWidth: 50 }}>
                        <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20, color: accent, lineHeight: 1 }}>{date.getDate()}</span>
                        <span style={{ fontSize: 10, color: accent, fontWeight: 600, textTransform: "uppercase", opacity: 0.8 }}>{date.toLocaleString("default", { month: "short" })}</span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={"/events/" + event?.id} style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, display: "block", marginBottom: 4, color: "var(--text)" }}>
                        {event?.title || "Unknown Event"}
                      </Link>
                      <p style={{ fontSize: 12, color: "var(--muted)" }}>📍 {event?.location}</p>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: isConfirmed ? "rgba(71,255,156,0.1)" : "var(--surface2)", color: isConfirmed ? "var(--success)" : "var(--muted)", border: "1px solid " + (isConfirmed ? "rgba(71,255,156,0.25)" : "var(--border)") }}>
                          {isConfirmed ? "Confirmed" : "Cancelled"}
                        </span>
                        {reg.amountPaid > 0 && (
                          <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(232,255,71,0.1)", color: "var(--neon1)", border: "1px solid rgba(232,255,71,0.25)" }}>
                            {"₹" + reg.amountPaid + " Paid"}
                          </span>
                        )}
                        {(!reg.amountPaid || reg.amountPaid <= 0) && isConfirmed && (
                          <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(71,255,156,0.1)", color: "var(--success)", border: "1px solid rgba(71,255,156,0.25)" }}>FREE</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      {reg.transactionId && (
                        <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{reg.transactionId}</span>
                      )}
                      {isConfirmed && !isPast && (
                        <button onClick={() => handleCancel(event?.id)} style={s.cancelBtn}>Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  hero:       { padding: "60px 24px 48px", borderBottom: "1px solid var(--border2)", position: "relative", overflow: "hidden", background: "linear-gradient(180deg,var(--surface),var(--bg))" },
  orb:        { position: "absolute", top: "-40%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(184,71,255,0.07),transparent 70%)", pointerEvents: "none" },
  heroInner:  { maxWidth: 800, margin: "0 auto", position: "relative" },
  title:      { fontFamily: "var(--font-head)", fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, marginBottom: 8 },
  sub:        { color: "var(--muted)", fontSize: 15, marginBottom: 28 },
  statsRow:   { display: "flex", gap: 14, flexWrap: "wrap" },
  container:  { maxWidth: 800, margin: "0 auto", padding: "36px 24px", display: "flex", flexDirection: "column", gap: 12 },
  cancelBtn:  { padding: "6px 14px", background: "rgba(255,79,106,0.08)", border: "1px solid rgba(255,79,106,0.25)", color: "var(--danger)", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  browseBtn:  { marginTop: 8, padding: "12px 28px", background: "linear-gradient(135deg,var(--neon2),var(--neon3))", color: "#fff", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-head)", border: "none", cursor: "pointer" },
  successBox: { background: "rgba(71,255,156,0.08)", border: "1px solid rgba(71,255,156,0.2)", color: "var(--success)", borderRadius: "var(--radius)", padding: "12px 16px", fontSize: 13 },
  errorBox:   { background: "rgba(255,79,106,0.08)", border: "1px solid rgba(255,79,106,0.2)", color: "var(--danger)", borderRadius: "var(--radius)", padding: "12px 16px", fontSize: 13 },
}
