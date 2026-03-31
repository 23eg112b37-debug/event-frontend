import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserRewards } from "../api/api"
import { useAuth } from "../context/AuthContext"

var TIERS = [
  { key: "NONE",     label: "No Tier",  icon: "🎫", color: "var(--muted)",  min: 0,  discount: 0 },
  { key: "BRONZE",   label: "Bronze",   icon: "🥉", color: "var(--neon4)", min: 1,  discount: 5 },
  { key: "SILVER",   label: "Silver",   icon: "🥈", color: "#c0c0c0",     min: 3,  discount: 10 },
  { key: "GOLD",     label: "Gold",     icon: "🥇", color: "var(--neon1)", min: 6,  discount: 15 },
  { key: "PLATINUM", label: "Platinum", icon: "💎", color: "var(--neon3)", min: 11, discount: 20 },
]

export default function Rewards() {
  const { user }    = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUserRewards(user.userId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div style={{ padding: 80, textAlign: "center", color: "var(--muted)" }}>Loading rewards...</div>
  if (!data)   return <div style={{ padding: 80, textAlign: "center", color: "var(--muted)" }}>Failed to load rewards.</div>

  var currentTier  = TIERS.find((t) => t.key === data.tier) || TIERS[0]
  var currentIdx   = TIERS.findIndex((t) => t.key === data.tier)
  var nextTier     = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null
  var progress     = nextTier
    ? Math.min(100, Math.round(((data.attendedCount - currentTier.min) / Math.max(1, nextTier.min - currentTier.min)) * 100))
    : 100

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={s.hero}>
        <div style={{ position: "absolute", top: "-40%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle," + currentTier.color + "10,transparent 70%)", pointerEvents: "none" }} />
        <div style={s.heroInner}>
          <h1 style={s.title}>Your Rewards</h1>
          <p style={s.sub}>Attend events, earn tiers, unlock discounts</p>
        </div>
      </div>

      <div style={s.container}>
        <div style={s.topGrid}>
          <div style={{ background: "var(--surface)", border: "1px solid " + currentTier.color + "40", borderRadius: "var(--radius-lg)", padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", boxShadow: "0 0 40px " + currentTier.color + "12" }}>
            <div style={{ fontSize: 52 }}>{currentTier.icon}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800 }}>{currentTier.label} Member</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 40, fontWeight: 800, color: currentTier.color }}>{currentTier.discount}% OFF</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, maxWidth: 220 }}>
              {currentTier.discount > 0
                ? "You get " + currentTier.discount + "% discount on all paid events!"
                : "Register for your first event to start earning rewards!"}
            </div>
            <div style={{ background: currentTier.color + "10", border: "1px solid " + currentTier.color + "30", borderRadius: "var(--radius)", padding: "12px 24px", display: "flex", flexDirection: "column", alignItems: "center", marginTop: 4 }}>
              <span style={{ fontFamily: "var(--font-head)", fontSize: 34, fontWeight: 800, color: currentTier.color }}>{data.attendedCount}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>events attended</span>
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-lg)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800 }}>Progress to Next Tier</h3>

            {nextTier ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 30 }}>{currentTier.icon}</div>
                    <div style={{ fontSize: 11, color: currentTier.color, fontWeight: 700 }}>{currentTier.label}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: "var(--surface2)", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: progress + "%", background: "linear-gradient(90deg," + currentTier.color + "," + nextTier.color + ")", borderRadius: 5, transition: "width 1s ease" }} />
                    </div>
                    <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                      {data.attendedCount} / {nextTier.min} events
                      {" — "}
                      <span style={{ color: nextTier.color, fontWeight: 700 }}>{data.eventsToNextTier} more to go!</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 30 }}>{nextTier.icon}</div>
                    <div style={{ fontSize: 11, color: nextTier.color, fontWeight: 700 }}>{nextTier.label}</div>
                  </div>
                </div>

                <div style={{ borderRadius: "var(--radius)", padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", background: nextTier.color + "06", border: "1px solid " + nextTier.color + "30" }}>
                  <span style={{ fontSize: 18 }}>{nextTier.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Unlock {nextTier.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                      Attend {data.eventsToNextTier} more events to get{" "}
                      <span style={{ color: nextTier.color, fontWeight: 700 }}>{nextTier.discount}% off</span> all paid events
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💎</div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800, color: "var(--neon3)" }}>Maximum Tier Reached!</div>
                <div style={{ color: "var(--muted)", marginTop: 8, fontSize: 13 }}>You enjoy the best 20% discount on all paid events</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800, marginBottom: 20 }}>All Reward Tiers</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {TIERS.filter((t) => t.key !== "NONE").map((tier) => {
              var isActive = data.tier === tier.key
              var tierIdx  = TIERS.findIndex((t) => t.key === tier.key)
              var currIdx  = TIERS.findIndex((t) => t.key === data.tier)
              var isPast   = tierIdx < currIdx
              var isLocked = !isActive && !isPast

              return (
                <div key={tier.key} style={{ borderRadius: "var(--radius)", padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: "1px solid " + (isActive ? tier.color : isLocked ? "var(--border)" : "var(--border2)"), background: isActive ? tier.color + "08" : "var(--surface2)", opacity: isLocked ? 0.5 : 1, boxShadow: isActive ? "0 0 20px " + tier.color + "20" : undefined }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{tier.icon}</div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: isActive ? tier.color : isLocked ? "var(--muted)" : "var(--muted2)" }}>{tier.label}</div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 18, color: isActive ? tier.color : "var(--muted2)" }}>{tier.discount}% OFF</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{tier.min}+ events</div>
                  {isActive && <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: tier.color, background: tier.color + "15", padding: "3px 10px", borderRadius: 20 }}>YOUR TIER</div>}
                  {isPast   && <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "var(--success)", background: "rgba(71,255,156,0.1)", padding: "3px 10px", borderRadius: 20 }}>ACHIEVED</div>}
                  {isLocked && <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "var(--muted)", background: "var(--surface3)", padding: "3px 10px", borderRadius: 20 }}>LOCKED</div>}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <Link to="/events">
            <button style={s.ctaBtn}>Browse Events and Earn Rewards</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

const s = {
  hero:     { padding: "60px 24px 48px", borderBottom: "1px solid var(--border2)", position: "relative", overflow: "hidden", background: "linear-gradient(180deg,var(--surface),var(--bg))" },
  heroInner:{ maxWidth: 900, margin: "0 auto", position: "relative" },
  title:    { fontFamily: "var(--font-head)", fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, marginBottom: 8 },
  sub:      { color: "var(--muted)", fontSize: 15 },
  container:{ maxWidth: 900, margin: "0 auto", padding: "36px 24px", display: "flex", flexDirection: "column", gap: 22 },
  topGrid:  { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 },
  ctaBtn:   { padding: "14px 36px", background: "linear-gradient(135deg,var(--neon2),var(--neon3))", color: "#fff", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-head)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(184,71,255,0.4)" },
}
