import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getEventById, cancelReg, getMyRegs, processPayment, getDiscountPreview } from "../api/api"
import { useAuth } from "../context/AuthContext"

const ACCENTS  = ["var(--neon1)", "var(--neon2)", "var(--neon3)", "var(--neon4)", "var(--neon5)"]
const CAT_ICONS = { TECH: "💻", NON_TECH: "🎨", FEST: "🎪", CONCERT: "🎵", SPORTS: "⚽", WORKSHOP: "🔧", NETWORKING: "🤝", OTHER: "✦" }

function launchConfetti() {
  var colors = ["#e8ff47", "#b847ff", "#47e8ff", "#ff6b47", "#47ff9c", "#ff47b8", "#ffffff"]
  for (var i = 0; i < 150; i++) {
    var el   = document.createElement("div")
    var size = Math.random() * 12 + 4
    var isCircle = Math.random() > 0.5
    el.style.cssText = [
      "position:fixed", "pointer-events:none", "z-index:9999",
      "border-radius:" + (isCircle ? "50%" : "2px"),
      "width:" + size + "px",
      "height:" + (isCircle ? size : size * 0.4) + "px",
      "background:" + colors[Math.floor(Math.random() * colors.length)],
      "left:" + Math.random() * 100 + "vw",
      "top:-20px"
    ].join(";")
    document.body.appendChild(el)
    var duration = Math.random() * 2000 + 1500
    var xDrift   = (Math.random() - 0.5) * 400
    var rotation = Math.random() * 720
    var anim = el.animate(
      [
        { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: 1 },
        { transform: "translateY(110vh) translateX(" + xDrift + "px) rotate(" + rotation + "deg)", opacity: 0 }
      ],
      { duration: duration, easing: "cubic-bezier(0.25,0.46,0.45,0.94)", fill: "forwards" }
    )
    anim.onfinish = function() { el.remove() }
  }
}

export default function EventDetail() {
  const { id }   = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [event,       setEvent]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [registered,  setRegistered]  = useState(false)
  const [showPay,     setShowPay]     = useState(false)
  const [showBill,    setShowBill]    = useState(false)
  const [billData,    setBillData]    = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [msg,         setMsg]         = useState({ type: "", text: "" })

  useEffect(() => {
    async function load() {
      try {
        var ev = await getEventById(id)
        setEvent(ev)
        if (user) {
          var regs = await getMyRegs(user.userId)
          var found = regs.find(function(r) { return r.event && r.event.id === Number(id) && r.status === "CONFIRMED" })
          setRegistered(!!found)
          if (ev.price > 0 && user.discountPercent > 0) {
            var prev = await getDiscountPreview(user.userId, id)
            setPreview(prev)
          }
        }
      } catch (err) {
        setMsg({ type: "error", text: "Failed to load event." })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user])

  function handlePaySuccess(result) {
    setShowPay(false)
    setRegistered(true)
    setEvent(function(ev) { return { ...ev, registeredCount: ev.registeredCount + 1 } })
    setBillData(result)
    setShowBill(true)
    launchConfetti()
  }

  async function handleCancel() {
    if (!window.confirm("Cancel your registration?")) return
    try {
      await cancelReg(user.userId, id)
      setRegistered(false)
      setEvent(function(ev) { return { ...ev, registeredCount: Math.max(0, ev.registeredCount - 1) } })
      setMsg({ type: "success", text: "Registration cancelled." })
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Failed." })
    }
  }

  if (loading) return <div style={{ padding: 80, textAlign: "center", color: "var(--muted)" }}>Loading event...</div>
  if (!event)  return <div style={{ padding: 80, textAlign: "center", color: "var(--muted)" }}>Event not found.</div>

  var date    = new Date(event.eventDate)
  var isPast  = date < new Date()
  var isFull  = event.registeredCount >= event.capacity
  var pct     = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
  var isFree  = !event.price || event.price <= 0
  var accent  = ACCENTS[event.id % ACCENTS.length]
  var catIcon = CAT_ICONS[event.category] || "✦"

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ ...s.banner, borderBottom: "1px solid " + accent + "30" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 100%," + accent + "10,transparent)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <Link to="/events" style={{ display: "inline-block", color: "var(--muted2)", fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
            Back to Events
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 26 }}>{catIcon}</span>
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: accent, background: accent + "12", border: "1px solid " + accent + "30" }}>
              {(event.category || "").replace("_", " ")}
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            {event.title}
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isPast  && <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "var(--muted)", background: "var(--surface3)", border: "1px solid var(--border)" }}>Past Event</span>}
            {isFull && !isPast && <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "var(--danger)", background: "rgba(255,79,106,0.1)", border: "1px solid rgba(255,79,106,0.3)" }}>Fully Booked</span>}
            {!isFree && <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "var(--neon1)", background: "rgba(232,255,71,0.1)", border: "1px solid rgba(232,255,71,0.3)" }}>{"₹" + event.price}</span>}
            {isFree  && <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "var(--success)", background: "rgba(71,255,156,0.1)", border: "1px solid rgba(71,255,156,0.3)" }}>FREE</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "-28px auto 0", padding: "0 24px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["📅", "Date", date.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }), "var(--neon2)"],
                ["📍", "Location", event.location, "var(--neon3)"],
                ["👥", "Registered", event.registeredCount + " / " + event.capacity, "var(--neon4)"],
                ["💰", "Price", isFree ? "FREE" : "₹" + event.price.toFixed(2), "var(--neon1)"],
              ].map(function(item) {
                return (
                  <div key={item[1]} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: item[3] + "15", color: item[3], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item[0]}</div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{item[1]}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item[1] === "Price" ? item[3] : "var(--text)" }}>{item[2]}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {preview && preview.discountPercent > 0 && (
              <div style={{ borderRadius: "var(--radius)", padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid rgba(232,255,71,0.25)", background: "rgba(232,255,71,0.04)" }}>
                <span style={{ fontSize: 20 }}>🎉</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--neon1)", fontSize: 14 }}>Your {user.tier} discount applies!</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                    You save <strong style={{ color: "var(--neon1)" }}>{"₹" + preview.discountAmount.toFixed(2)} ({preview.discountPercent}% off)</strong>
                    {" — "}Final price: <strong style={{ color: "var(--success)" }}>{"₹" + preview.finalPrice.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            {event.description && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 22 }}>
                <h2 style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>About This Event</h2>
                <p style={{ color: "var(--muted2)", lineHeight: 1.8, fontSize: 14 }}>{event.description}</p>
              </div>
            )}
          </div>

          <div style={{ position: "sticky", top: 88 }}>
            <div style={{ background: "var(--surface)", border: "1px solid " + accent + "40", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "0 0 0 1px " + accent + "20, var(--shadow-lg)" }}>
              <div style={{ padding: 22, background: "linear-gradient(135deg,var(--surface2),var(--surface3))", borderBottom: "1px solid " + accent + "30" }}>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 56, fontWeight: 800, color: accent, lineHeight: 1, textShadow: "0 0 30px " + accent + "60" }}>{date.getDate()}</div>
                <div style={{ color: "var(--muted2)", fontSize: 13, marginBottom: 8 }}>{date.toLocaleString("default", { month: "long", year: "numeric" })}</div>
                {preview && preview.discountPercent > 0 ? (
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", textDecoration: "line-through" }}>{"₹" + event.price.toFixed(2)}</div>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, color: "var(--success)" }}>{"₹" + preview.finalPrice.toFixed(2)}</div>
                  </div>
                ) : (
                  <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, color: isFree ? "var(--success)" : accent }}>{isFree ? "FREE" : "₹" + event.price.toFixed(2)}</div>
                )}
              </div>

              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ height: 4, background: "var(--surface2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: accent, borderRadius: 2, boxShadow: "0 0 8px " + accent + "60" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                    <span>{event.registeredCount} going</span>
                    <span>{event.capacity - event.registeredCount} left</span>
                  </div>
                </div>

                {msg.text && (
                  <div style={msg.type === "success" ? s.successBox : s.errorBox}>{msg.text}</div>
                )}

                {!isPast && (
                  registered ? (
                    <button onClick={handleCancel} style={s.cancelBtn}>Registered — Click to Cancel</button>
                  ) : (
                    <button
                      onClick={() => { if (!user) { navigate("/login"); return } setShowPay(true) }}
                      disabled={isFull}
                      style={{
                        padding: 13, borderRadius: "var(--radius)", fontWeight: 700, fontSize: 14,
                        fontFamily: "var(--font-head)", border: "none", width: "100%",
                        background: isFull ? "var(--surface3)" : accent,
                        color: isFull ? "var(--muted)" : "#0a0a0f",
                        cursor: isFull ? "not-allowed" : "pointer",
                        boxShadow: isFull ? "none" : "0 4px 20px " + accent + "50"
                      }}
                    >
                      {isFull ? "Event Full" : isFree ? "Register Free" : "Pay and Register"}
                    </button>
                  )
                )}

                {!user && !isPast && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
                    <Link to="/login" style={{ color: accent, fontWeight: 700 }}>Sign in</Link> to register
                  </p>
                )}

                {user && !isFree && !registered && !isPast && (
                  <Link to="/rewards" style={{ textAlign: "center", fontSize: 12, color: "var(--neon1)", display: "block" }}>
                    View your rewards and discounts
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPay  && <PayModal event={event} user={user} accent={accent} preview={preview} onSuccess={handlePaySuccess} onClose={() => setShowPay(false)} />}
      {showBill && billData && <BillModal bill={billData} event={event} user={user} accent={accent} onClose={() => setShowBill(false)} />}
    </div>
  )
}

function PayModal({ event, user, accent, preview, onSuccess, onClose }) {
  var isFree    = !event.price || event.price <= 0
  var finalPrice = preview ? preview.finalPrice : event.price
  var discount   = preview ? preview.discountPercent : 0

  const [cardName,   setCardName]   = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry,     setExpiry]     = useState("")
  const [cvv,        setCvv]        = useState("")
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState("")

  async function submit(e) {
    if (e) e.preventDefault()
    setLoading(true)
    setError("")
    try {
      var result = await processPayment({
        userId: user.userId, eventId: event.id,
        cardName: cardName, cardNumber: cardNumber.replace(/\s/g, ""),
        expiry: expiry, cvv: cvv
      })
      onSuccess(result)
    } catch (err) {
      setError(err.response?.data?.error || "Payment failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={{ ...s.modal, boxShadow: "0 0 0 1px " + accent + "30, 0 25px 60px rgba(0,0,0,0.7)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + accent + "30" }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 800 }}>
            {isFree ? "Confirm Registration" : "Complete Payment"}
          </h2>
          <button onClick={onClose} style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 15, cursor: "pointer", borderRadius: 8, padding: "4px 10px" }}>
            X
          </button>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "linear-gradient(135deg,var(--surface2),var(--surface3))", border: "1px solid " + accent + "30", borderRadius: "var(--radius)", padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{event.title}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>📍 {event.location}</div>
            {discount > 0 && (
              <div style={{ background: "rgba(232,255,71,0.06)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: "var(--neon1)", fontWeight: 700 }}>Discount {discount}% off — save {"₹" + preview.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border2)" }}>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>Total</span>
              <span style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, color: accent }}>
                {isFree ? "FREE" : "₹" + finalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          {isFree ? (
            <button onClick={submit} style={{ padding: 14, background: accent, color: "#0a0a0f", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-head)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px " + accent + "50" }} disabled={loading}>
              {loading ? "Registering..." : "Confirm Registration"}
            </button>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={s.field}>
                <label style={s.label}>CARDHOLDER NAME</label>
                <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card" required style={s.input} />
              </div>
              <div style={s.field}>
                <label style={s.label}>CARD NUMBER</label>
                <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} required style={s.input} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={s.field}>
                  <label style={s.label}>EXPIRY</label>
                  <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} required style={s.input} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>CVV</label>
                  <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="..." maxLength={4} required style={s.input} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--success)", textAlign: "center", padding: 10, background: "rgba(71,255,156,0.06)", borderRadius: 8, border: "1px solid rgba(71,255,156,0.15)" }}>
                Demo mode — any card details work for testing
              </div>
              <button type="submit" style={{ padding: 14, background: accent, color: "#0a0a0f", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-head)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px " + accent + "50" }} disabled={loading}>
                {loading ? "Processing..." : "Pay ₹" + finalPrice.toFixed(2)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function BillModal({ bill, event, user, accent, onClose }) {
  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, boxShadow: "0 0 0 1px " + accent + "40, 0 25px 60px rgba(0,0,0,0.8)" }} className="fade-up">
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
        <div style={{ padding: "28px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, borderBottom: "1px solid " + accent + "30" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: accent + "20", border: "2px solid " + accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
            🎉
          </div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 800, color: accent, textAlign: "center" }}>
            {bill.amountPaid > 0 ? "Payment Successful!" : "You are Registered!"}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 12 }}>Your spot is confirmed</p>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--surface2)", border: "1px solid " + accent + "25", borderRadius: "var(--radius)", padding: 18, display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 14, color: accent }}>EventHub</span>
              <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Receipt</span>
            </div>
            <div style={{ height: 1, background: "var(--border2)" }} />
            {[
              ["Event", event.title],
              ["Attendee", "@" + user.username],
              ["Category", (event.category || "").replace("_", " ")],
              ["Date", new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
              ["Venue", event.location],
              ["Booking ID", "#" + bill.registrationId],
              ...(bill.amountPaid > 0 ? [["Transaction", bill.transactionId]] : [])
            ].map(function(row) {
              return (
                <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0 }}>{row[0]}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, textAlign: "right", fontFamily: row[0] === "Transaction" ? "monospace" : "inherit" }}>{row[1]}</span>
                </div>
              )
            })}
            {bill.discountAmount > 0 && (
              <>
                <div style={{ height: 1, background: "var(--border2)" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Original Price</span>
                  <span style={{ fontSize: 12, textDecoration: "line-through", color: "var(--muted)" }}>{"₹" + bill.originalPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{bill.userTier} Discount ({bill.discountPercent}%)</span>
                  <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 700 }}>{"-₹" + bill.discountAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div style={{ height: 1, background: "var(--border2)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Amount Paid</span>
              <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 24, color: accent }}>
                {bill.amountPaid > 0 ? "₹" + bill.amountPaid.toFixed(2) : "FREE"}
              </span>
            </div>
            {bill.newTier && bill.newTier !== user.tier && (
              <div style={{ background: "rgba(232,255,71,0.08)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--neon1)", textAlign: "center" }}>
                Tier upgraded to {bill.newTier}!
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ padding: 14, background: accent, color: "#0a0a0f", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-head)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px " + accent + "50" }}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  banner:     { padding: "52px 24px 64px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,var(--surface),var(--surface2))" },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal:      { background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", position: "relative" },
  field:      { display: "flex", flexDirection: "column", gap: 8 },
  label:      { fontSize: 11, fontWeight: 700, color: "var(--muted2)", letterSpacing: "0.08em" },
  input:      { background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: "12px 14px", color: "var(--text)", fontSize: 14 },
  cancelBtn:  { padding: 12, background: "rgba(255,79,106,0.08)", color: "var(--danger)", border: "1px solid rgba(255,79,106,0.25)", borderRadius: "var(--radius)", fontWeight: 600, fontSize: 13, cursor: "pointer", width: "100%" },
  successBox: { background: "rgba(71,255,156,0.08)", border: "1px solid rgba(71,255,156,0.2)", color: "var(--success)", borderRadius: "var(--radius)", padding: "8px 12px", fontSize: 12 },
  errorBox:   { background: "rgba(255,79,106,0.08)", border: "1px solid rgba(255,79,106,0.2)", color: "var(--danger)", borderRadius: "var(--radius)", padding: "8px 12px", fontSize: 12 },
}
