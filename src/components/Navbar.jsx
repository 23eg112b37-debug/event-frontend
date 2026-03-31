import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const TIER_COLOR = { PLATINUM: "var(--neon3)", GOLD: "var(--neon1)", SILVER: "#c0c0c0", BRONZE: "var(--neon4)", NONE: "var(--muted)" }
const TIER_ICON  = { PLATINUM: "💎", GOLD: "🥇", SILVER: "🥈", BRONZE: "🥉", NONE: "🎫" }

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(path) {
    return location.pathname === path
  }

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <nav style={s.nav}>
      <div style={s.topLine} />
      <div style={s.inner}>
        <Link to="/" style={s.logo}>
          <div style={s.logoBox}>◈</div>
          <span style={s.logoText}>EVENT<span style={s.logoAccent}>HUB</span></span>
        </Link>

        <div style={s.links}>
          <Link to="/events" style={isActive("/events") ? { ...s.link, ...s.linkActive } : s.link}>Events</Link>
          {user && (
            <Link to="/my-registrations" style={isActive("/my-registrations") ? { ...s.link, ...s.linkActive } : s.link}>
              My Tickets
            </Link>
          )}
          {user && (
            <Link to="/rewards" style={isActive("/rewards") ? { ...s.link, ...s.linkActive } : s.link}>
              Rewards ✦
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={isActive("/admin") ? { ...s.link, ...s.linkActive } : s.link}>
              ⚡ Admin
            </Link>
          )}
        </div>

        <div style={s.actions}>
          {user ? (
            <>
              <div style={s.chip}>
                <span style={s.dot} />
                <span style={s.chipName}>@{user.username}</span>
                {user.tier && user.tier !== "NONE" && (
                  <span style={{ ...s.tierBadge, color: TIER_COLOR[user.tier] }}>
                    {TIER_ICON[user.tier]} {user.tier}
                  </span>
                )}
              </div>
              <button onClick={handleLogout} style={s.btnOut}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"><button style={s.btnOut}>Login</button></Link>
              <Link to="/register"><button style={s.btnFill}>Sign Up</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const s = {
  nav:       { position: "sticky", top: 0, zIndex: 100, background: "rgba(8,8,16,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border2)", overflow: "hidden" },
  topLine:   { height: 1, background: "linear-gradient(90deg,transparent,var(--neon2),transparent)", opacity: 0.4 },
  inner:     { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 28 },
  logo:      { display: "flex", alignItems: "center", gap: 10 },
  logoBox:   { width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,var(--neon2),var(--neon3))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800 },
  logoText:  { fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 19, letterSpacing: 2 },
  logoAccent:{ color: "var(--neon1)" },
  links:     { display: "flex", gap: 4, flex: 1 },
  link:      { padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "var(--muted2)", transition: "all 0.2s" },
  linkActive:{ color: "var(--text)", background: "var(--surface3)" },
  actions:   { display: "flex", alignItems: "center", gap: 10 },
  chip:      { display: "flex", alignItems: "center", gap: 7, padding: "5px 12px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 20 },
  dot:       { width: 7, height: 7, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 6px var(--success)" },
  chipName:  { fontSize: 12, fontWeight: 500 },
  tierBadge: { fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "rgba(255,255,255,0.05)" },
  btnOut:    { padding: "7px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid var(--border2)", background: "transparent", color: "var(--text)", cursor: "pointer" },
  btnFill:   { padding: "7px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,var(--neon2),var(--neon3))", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(184,71,255,0.3)" },
}
