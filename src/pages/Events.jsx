import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAllEvents, searchEvents, getByCategory } from "../api/api"

const CATEGORIES = [
  { key: "ALL",        label: "All",        icon: "✦", color: "var(--neon2)" },
  { key: "TECH",       label: "Tech",       icon: "💻", color: "var(--neon3)" },
  { key: "NON_TECH",   label: "Non-Tech",   icon: "🎨", color: "var(--neon4)" },
  { key: "FEST",       label: "Fest",       icon: "🎪", color: "var(--neon1)" },
  { key: "CONCERT",    label: "Concert",    icon: "🎵", color: "var(--neon5)" },
  { key: "SPORTS",     label: "Sports",     icon: "⚽", color: "#ff6b47" },
  { key: "WORKSHOP",   label: "Workshop",   icon: "🔧", color: "#b847ff" },
  { key: "NETWORKING", label: "Networking", icon: "🤝", color: "#47e8ff" },
]

const ACCENTS = ["var(--neon1)", "var(--neon2)", "var(--neon3)", "var(--neon4)", "var(--neon5)"]
const CAT_ICONS = { TECH: "💻", NON_TECH: "🎨", FEST: "🎪", CONCERT: "🎵", SPORTS: "⚽", WORKSHOP: "🔧", NETWORKING: "🤝", OTHER: "✦" }

export default function Events() {
  const [events, setEvents]     = useState([])
  const [keyword, setKeyword]   = useState("")
  const [activeTab, setActiveTab] = useState("ALL")
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")

  async function fetchEvents(kw, cat) {
    setLoading(true)
    setError("")
    try {
      let data
      if (kw && kw.trim()) {
        data = await searchEvents(kw)
      } else if (cat && cat !== "ALL") {
        data = await getByCategory(cat)
      } else {
        data = await getAllEvents()
      }
      setEvents(data)
    } catch (err) {
      setError("Failed to load events. Make sure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents("", "ALL")
  }, [])

  function handleTab(cat) {
    setActiveTab(cat)
    setKeyword("")
    fetchEvents("", cat)
  }

  function handleSearch(e) {
    e.preventDefault()
    setActiveTab("ALL")
    fetchEvents(keyword, "ALL")
  }

  const catInfo = CATEGORIES.find((c) => c.key === activeTab) || CATEGORIES[0]

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.orb1} />
        <div style={s.orb2} />
        <div style={s.heroInner}>
          <div style={s.heroTag}>✦ Discover Events</div>
          <h1 style={s.heroTitle}>
            Find Your Next<br />
            <span style={s.heroGrad}>Experience</span>
          </h1>
          <p style={s.heroSub}>Attend events, earn rewards, unlock discounts</p>
          <form onSubmit={handleSearch} style={s.searchWrap}>
            <div style={s.searchBar}>
              <span style={{ fontSize: 16, padding: "0 8px", color: "var(--muted)" }}>⌕</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search events..."
                style={s.searchInput}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => { setKeyword(""); fetchEvents("", activeTab) }}
                  style={s.clearBtn}
                >
                  ✕
                </button>
              )}
              <button type="submit" style={s.searchBtn}>Search</button>
            </div>
          </form>
        </div>
      </div>

      <div style={s.container}>
        <div style={s.tabs}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleTab(cat.key)}
              style={activeTab === cat.key
                ? { ...s.tab, color: cat.color, borderColor: cat.color, background: cat.color + "12" }
                : s.tab
              }
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>{catInfo.icon} {activeTab === "ALL" ? "All Events" : catInfo.label + " Events"}</h2>
          <span style={s.countBadge}>{events.length} events</span>
        </div>

        {loading ? (
          <div style={s.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ ...s.card, opacity: 1 }}>
                <div style={{ height: 3, background: "var(--surface2)" }} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ height: 18, width: "70%", background: "var(--surface2)", borderRadius: 6, animation: "pulse 1.4s infinite" }} />
                  <div style={{ height: 12, width: "50%", background: "var(--surface2)", borderRadius: 6, animation: "pulse 1.4s infinite" }} />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 56 }}>{catInfo.icon}</div>
            <p style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, marginTop: 16 }}>
              No {catInfo.label} events found
            </p>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>Check back later or try another category</p>
          </div>
        ) : (
          <div style={s.grid}>
            {events.map((ev, i) => {
              const accent = ACCENTS[i % ACCENTS.length]
              const date   = new Date(ev.eventDate)
              const isPast = date < new Date()
              const isFull = ev.registeredCount >= ev.capacity
              const pct    = Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100))
              const isFree = !ev.price || ev.price <= 0
              const catIcon = CAT_ICONS[ev.category] || "✦"

              return (
                <Link to={"/events/" + ev.id} key={ev.id} style={{ textDecoration: "none" }}>
                  <div
                    style={{ ...s.card, animationDelay: (i * 60) + "ms", opacity: 0 }}
                    className="fade-up"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = accent
                      e.currentTarget.style.boxShadow  = "0 8px 32px " + accent + "25"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)"
                      e.currentTarget.style.boxShadow   = "var(--shadow)"
                    }}
                  >
                    <div style={{ height: 3, background: accent }} />
                    <div style={{ padding: "14px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ background: accent + "15", border: "1px solid " + accent + "40", borderRadius: 10, padding: "8px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, color: accent, lineHeight: 1 }}>{date.getDate()}</span>
                        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>{date.toLocaleString("default", { month: "short" })}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "var(--muted2)", background: "var(--surface2)", border: "1px solid var(--border)" }}>{catIcon} {(ev.category || "").replace("_", " ")}</span>
                        {isFree  && <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "var(--success)", background: "rgba(71,255,156,0.1)", border: "1px solid rgba(71,255,156,0.25)" }}>FREE</span>}
                        {!isFree && <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "var(--neon1)", background: "rgba(232,255,71,0.1)", border: "1px solid rgba(232,255,71,0.25)" }}>{"₹" + ev.price}</span>}
                        {isFull  && <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "var(--danger)", background: "rgba(255,79,106,0.1)", border: "1px solid rgba(255,79,106,0.25)" }}>FULL</span>}
                        {isPast  && <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "var(--muted)", background: "var(--surface2)", border: "1px solid var(--border)" }}>PAST</span>}
                      </div>
                    </div>
                    <div style={{ padding: "12px 16px 8px" }}>
                      <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{ev.title}</h3>
                      <p style={{ fontSize: 12, color: "var(--muted)" }}>📍 {ev.location}</p>
                      {ev.description && (
                        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginTop: 6 }}>
                          {ev.description.length > 80 ? ev.description.slice(0, 80) + "…" : ev.description}
                        </p>
                      )}
                    </div>
                    <div style={{ padding: "0 16px 14px" }}>
                      <div style={{ height: 3, background: "var(--surface2)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct + "%", background: accent, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{ev.registeredCount}/{ev.capacity} registered</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page:        { minHeight: "100vh" },
  hero:        { padding: "80px 24px 72px", position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border2)" },
  orb1:        { position: "absolute", top: "-30%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(184,71,255,0.08),transparent 70%)", pointerEvents: "none" },
  orb2:        { position: "absolute", bottom: "-30%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(71,232,255,0.06),transparent 70%)", pointerEvents: "none" },
  heroInner:   { maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" },
  heroTag:     { display: "inline-block", background: "rgba(232,255,71,0.08)", border: "1px solid rgba(232,255,71,0.2)", color: "var(--neon1)", borderRadius: 20, padding: "6px 18px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 },
  heroTitle:   { fontFamily: "var(--font-head)", fontSize: "clamp(40px,7vw,72px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 16 },
  heroGrad:    { background: "linear-gradient(135deg,var(--neon2),var(--neon3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub:     { color: "var(--muted2)", fontSize: 16, marginBottom: 40 },
  searchWrap:  { display: "flex", justifyContent: "center" },
  searchBar:   { display: "flex", maxWidth: 540, width: "100%", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 14, padding: 6, alignItems: "center" },
  searchInput: { flex: 1, background: "transparent", border: "none", padding: "10px 8px", color: "var(--text)", fontSize: 14 },
  searchBtn:   { padding: "10px 22px", background: "linear-gradient(135deg,var(--neon2),var(--neon3))", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" },
  clearBtn:    { padding: "8px 12px", background: "var(--surface2)", color: "var(--muted)", borderRadius: 8, border: "none", cursor: "pointer", marginRight: 4 },
  container:   { maxWidth: 1200, margin: "0 auto", padding: "36px 24px" },
  tabs:        { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)" },
  tab:         { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "var(--muted2)", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  sectionTitle:{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800 },
  countBadge:  { background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--neon2)", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 },
  grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 },
  card:        { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow)", transition: "border-color 0.2s,box-shadow 0.2s", animationFillMode: "forwards" },
  empty:       { textAlign: "center", padding: "80px 24px" },
  errorBox:    { background: "rgba(255,79,106,0.08)", border: "1px solid rgba(255,79,106,0.25)", color: "var(--danger)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20 },
}
