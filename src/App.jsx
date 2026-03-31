import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Events from "./pages/Events"
import EventDetail from "./pages/EventDetail"
import MyRegistrations from "./pages/MyRegistrations"
import AdminDashboard from "./pages/AdminDashboard"
import Rewards from "./pages/Rewards"

function ProtectedRoute({ children, adminOnly }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/events" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                  element={<Navigate to="/events" replace />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/events"            element={<Events />} />
        <Route path="/events/:id"        element={<EventDetail />} />
        <Route path="/my-registrations"  element={<ProtectedRoute><MyRegistrations /></ProtectedRoute>} />
        <Route path="/rewards"           element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        <Route path="/admin"             element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="*"                  element={<Navigate to="/events" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
