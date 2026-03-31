import { createContext, useContext, useState } from "react"
import { clearBasicAuth } from "../api/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("em_user")
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })

  function login(userData) {
    localStorage.setItem("em_user", JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem("em_user")
    clearBasicAuth()
    setUser(null)
  }

  const isAdmin = user && user.role === "ROLE_ADMIN"

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
