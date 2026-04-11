import axios from "axios"

const api = axios.create({ baseURL: "https://event-backend-vxkn.onrender.com/api" })
let _auth = null

export function setBasicAuth(u, p) {
  _auth = btoa(u + ":" + p)
}

export function clearBasicAuth() {
  _auth = null
}

api.interceptors.request.use((config) => {
  if (_auth) config.headers["Authorization"] = "Basic " + _auth
  return config
})

export const registerUser       = (d)       => api.post("/auth/register", d).then((r) => r.data)
export const loginUser          = (d)       => api.post("/auth/login", d).then((r) => r.data)
export const getAllEvents        = ()        => api.get("/events").then((r) => r.data)
export const searchEvents        = (kw)      => api.get("/events/search?keyword=" + kw).then((r) => r.data)
export const getEventById        = (id)      => api.get("/events/" + id).then((r) => r.data)
export const getByCategory       = (cat)     => api.get("/events/category/" + cat).then((r) => r.data)
export const createEvent         = (d)       => api.post("/events", d).then((r) => r.data)
export const updateEvent         = (id, d)   => api.put("/events/" + id, d).then((r) => r.data)
export const deleteEvent         = (id)      => api.delete("/events/" + id).then((r) => r.data)
export const cancelReg           = (uid, eid) => api.put("/registrations/cancel?userId=" + uid + "&eventId=" + eid).then((r) => r.data)
export const getMyRegs           = (uid)     => api.get("/registrations/user/" + uid).then((r) => r.data)
export const processPayment      = (d)       => api.post("/payment/pay", d).then((r) => r.data)
export const getDiscountPreview  = (uid, eid) => api.get("/payment/preview?userId=" + uid + "&eventId=" + eid).then((r) => r.data)
export const getUserRewards      = (uid)     => api.get("/rewards/user/" + uid).then((r) => r.data)
