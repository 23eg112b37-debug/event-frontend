import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllEvents, createEvent, updateEvent, deleteEvent } from "../api/api"
import { useAuth } from "../context/AuthContext"

var EMPTY = { title: "", description: "", location: "", eventDate: "", capacity: "", price: "0", category: "TECH" }
var ACCENTS = ["var(--neon1)", "var(--neon2)", "var(--neon3)", "var(--neon4)", "var(--neon5)"]
var CATS = [
  { key: "TECH",       label: "Tech" },
  { key: "NON_TECH",   label: "Non-Tech" },
  { key: "FEST",       label: "Fest" },
  { key: "CONCERT",    label: "Concert" },
  { key: "SPORTS",     label: "Sports" },
  { key: "WORKSHOP",   label: "Workshop" },
  { key: "NETWORKING", label: "Networking" },
]

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const navigate          = useNavigate()
  const [events,     setEvents]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [formErr,    setFormErr]    = useState("")
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState({ type: "", text: "" })

  useEffect(() => {
    if (!user || !isAdmin) { navigate("/"); return }
    load()
  }, [user])

  function load() {
    setLoading(true)
    getAllEvents().then(setEvents).catch(() => setMsg({ type: "error", text: "Failed to load." })).finally(() => setLoading(false))
  }

  function openCreate() { setForm(EMPTY); setEditTarget(null); setFormErr(""); setShowForm(true) }

  function openEdit(ev) {
    setForm({ title: ev.title, description: ev.description || "", location: ev.location, eventDate: ev.eventDate ? ev.eventDate.slice(0, 16) : "", capacity: ev.capacity, price: ev.price || "0", category: ev.category || "TECH" })
    setEditTarget(ev)
    setFormErr("")
    setShowForm(true)
  }

  function handleChange(e) {
    setForm(function(f) { return { ...f, [e.target.name]: e.target.value } })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormErr("")
    var payload = { ...form, capacity: Number(form.capacity), price: Number(form.price) || 0, eventDate: form.eventDate + ":00" }
    try {
      if (editTarget) {
        var updated = await updateEvent(editTarget.id, payload)
        setEvents(function(evs) { return evs.map(function(ev) { return ev.id === editTarget.id ? updated : ev }) })
        setMsg({ type: "success", text: "Event updated!" })
      } else {
        var created = await createEvent(payload)
        setEvents(function(evs) { return [created, ...evs] })
        setMsg({ type: "success", text: "Event created!" })
      }
      setShowForm(false)
    } catch (err) {
      setFormErr(err.response?.data?.error || "Operation failed.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event permanently?")) return
    try {
      await deleteEvent(id)
      setEvents(function(evs) { return evs.filter(function(ev) { return ev.id !== id }) })
      setMsg({ type: "success", text: "Event deleted." })
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Delete failed." })
    }
  }

  var totalRev = events.reduce(function(s, e) { return s + (e.price * e.registeredCount) }, 0)

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={s.hero}>
        <div style={s.orb} />
        <div style={s.heroInner}>
          <div style={s.tag}>Admin Panel</div>
          <h1 style={s.title}>Event Management</h1>
          <p style={s.sub}>Create and manage all your events</p>
        </div>
      </div>

      <div style={s.container}>
        <div style={s.statsGrid}>
          {[
            ["🗓", "Total Events",  events.length,                                                       "var(--neon2)", "rgba(184,71,255,0.08)"],
            ["🚀", "Upcoming",      events.filter(function(e) { return new Date(e.eventDate) > new Date() }).length, "var(--neon3)", "rgba(71,232,255,0.08)"],
            ["👥", "Registered",    events.reduce(function(s, e) { return s + e.registeredCount }, 0),    "var(--neon4)", "rgba(255,107,71,0.08)"],
            ["💰", "Revenue",       "₹" + totalRev.toLocaleString(),                                     "var(--neon1)", "rgba(232,255,71,0.08)"],
          ].map(function(item) {
            return (
              <div key={item[1]} style={{ borderRadius: "var(--radius-lg)", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 4, background: item[4], border: "1px solid " + item[3] + "25", boxShadow: "var(--shadow)" }}>
                <span style={{ fontSize: 22 }}>{item[0]}</span>
                <span style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800, color: item[3] }}>{item[2]}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{item[1]}</span>
              </div>
            )
          })}
        </div>

        <div style={s.tableCard}>
          <div style={s.tableHead}>
            <h2 style={s.tableTitle}>All Events</h2>
            <button onClick={openCreate} style={s.createBtn}>+ Create Event</button>
          </div>

          {msg.text && (
            <div style={{ ...(msg.type === "success" ? s.successBox : s.errorBox), margin: "0 20px 16px" }}>
              {msg.text}
              <button onClick={() => setMsg({ type: "", text: "" })} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", marginLeft: 8 }}>X</button>
            </div>
          )}

          {loading ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => <div key={i} style={{ height: 56, background: "var(--surface2)", borderRadius: "var(--radius)", animation: "pulse 1.4s infinite" }} />)}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>No events yet</p>
            </div>
          ) : (
            <div>
              {events.map(function(ev, i) {
                var date   = new Date(ev.eventDate)
                var isPast = date < new Date()
                var isFree = !ev.price || ev.price <= 0
                var pct    = Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100))
                var accent = ACCENTS[i % ACCENTS.length]
                var catInfo = CATS.find(function(c) { return c.key === ev.category }) || CATS[0]

                return (
                  <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < events.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 3, height: 36, borderRadius: 2, flexShrink: 0, background: accent }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15 }}>{ev.title}</span>
                        <span style={{ padding: "2px 7px", background: "var(--surface2)", color: "var(--muted2)", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>{catInfo.label}</span>
                        {isPast && <span style={{ padding: "2px 7px", background: "var(--surface2)", color: "var(--muted)", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>PAST</span>}
                        <span style={{ padding: "2px 7px", background: isFree ? "rgba(71,255,156,0.1)" : "rgba(232,255,71,0.1)", color: isFree ? "var(--success)" : "var(--neon1)", borderRadius: 8, fontSize: 10, fontWeight: 700, border: "1px solid " + (isFree ? "rgba(71,255,156,0.25)" : "rgba(232,255,71,0.25)") }}>
                          {isFree ? "FREE" : "₹" + ev.price}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {date.toLocaleDateString()} · {ev.location} · {ev.registeredCount}/{ev.capacity} ({pct}%)
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(ev)} style={s.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(ev.id)} style={s.delBtn}>Del</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div style={s.overlay} onClick={() => setShowForm(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTop}>
              <h2 style={s.modalTitle}>{editTarget ? "Edit Event" : "Create Event"}</h2>
              <button onClick={() => setShowForm(false)} style={s.closeBtn}>X</button>
            </div>
            {formErr && <div style={{ ...s.errorBox, margin: "0 24px 8px" }}>{formErr}</div>}
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}><label style={s.label}>TITLE</label><input name="title" value={form.title} onChange={handleChange} placeholder="Event name" required style={s.input} /></div>
              <div style={s.field}><label style={s.label}>LOCATION</label><input name="location" value={form.location} onChange={handleChange} placeholder="City, Venue" required style={s.input} /></div>
              <div style={s.field}>
                <label style={s.label}>CATEGORY</label>
                <select name="category" value={form.category} onChange={handleChange} style={s.input}>
                  {CATS.map(function(c) { return <option key={c.key} value={c.key}>{c.label}</option> })}
                </select>
              </div>
              <div style={s.field}><label style={s.label}>DATE AND TIME</label><input name="eventDate" type="datetime-local" value={form.eventDate} onChange={handleChange} required style={s.input} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={s.field}><label style={s.label}>CAPACITY</label><input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="100" required style={s.input} /></div>
                <div style={s.field}><label style={s.label}>PRICE (0 = Free)</label><input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" min="0" step="0.01" style={s.input} /></div>
              </div>
              <div style={s.field}><label style={s.label}>DESCRIPTION</label><textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the event..." rows={3} style={{ ...s.input, resize: "vertical" }} /></div>
              <div style={{ background: "rgba(71,255,156,0.06)", border: "1px solid rgba(71,255,156,0.15)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 12, color: "var(--success)" }}>
                Set price to 0 for free events. Discount tiers apply automatically for users.
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={s.cancelFormBtn}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={saving}>{saving ? "Saving..." : editTarget ? "Save Changes" : "Create Event"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  hero:          { padding: "60px 24px 48px", borderBottom: "1px solid var(--border2)", position: "relative", overflow: "hidden", background: "linear-gradient(180deg,var(--surface),var(--bg))" },
  orb:           { position: "absolute", top: "-40%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(232,255,71,0.05),transparent 70%)", pointerEvents: "none" },
  heroInner:     { maxWidth: 1000, margin: "0 auto", position: "relative" },
  tag:           { display: "inline-block", background: "rgba(232,255,71,0.08)", border: "1px solid rgba(232,255,71,0.2)", color: "var(--neon1)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 },
  title:         { fontFamily: "var(--font-head)", fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, marginBottom: 8 },
  sub:           { color: "var(--muted)", fontSize: 15 },
  container:     { maxWidth: 1000, margin: "0 auto", padding: "36px 24px", display: "flex", flexDirection: "column", gap: 22 },
  statsGrid:     { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 },
  tableCard:     { background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow)" },
  tableHead:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid var(--border)" },
  tableTitle:    { fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800 },
  createBtn:     { padding: "9px 20px", background: "linear-gradient(135deg,var(--neon2),var(--neon3))", color: "#fff", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" },
  editBtn:       { padding: "6px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  delBtn:        { padding: "6px 12px", background: "rgba(255,79,106,0.08)", border: "1px solid rgba(255,79,106,0.25)", color: "var(--danger)", borderRadius: 8, fontSize: 12, cursor: "pointer" },
  overlay:       { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal:         { background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.7)" },
  modalTop:      { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 24px 18px", borderBottom: "1px solid var(--border)" },
  modalTitle:    { fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 800 },
  closeBtn:      { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 15, cursor: "pointer", borderRadius: 8, padding: "4px 10px" },
  form:          { padding: 24, display: "flex", flexDirection: "column", gap: 16 },
  field:         { display: "flex", flexDirection: "column", gap: 8 },
  label:         { fontSize: 11, fontWeight: 700, color: "var(--muted2)", letterSpacing: "0.08em" },
  input:         { background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: "12px 14px", color: "var(--text)", fontSize: 14, width: "100%" },
  cancelFormBtn: { padding: "10px 20px", background: "transparent", border: "1px solid var(--border2)", color: "var(--muted)", borderRadius: "var(--radius)", fontSize: 14, cursor: "pointer" },
  submitBtn:     { padding: "10px 24px", background: "linear-gradient(135deg,var(--neon2),var(--neon3))", color: "#fff", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-head)", border: "none", cursor: "pointer" },
  successBox:    { background: "rgba(71,255,156,0.08)", border: "1px solid rgba(71,255,156,0.2)", color: "var(--success)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" },
  errorBox:      { background: "rgba(255,79,106,0.08)", border: "1px solid rgba(255,79,106,0.2)", color: "var(--danger)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" },
}
