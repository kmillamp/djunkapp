import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { IPhoneMenu } from './components/IPhoneMenu'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Agenda from './pages/Agenda'
import Projetos from './pages/Projetos'
import SelfCare from './pages/SelfCare'
import UNK from './pages/UNK'
import Branding from './pages/Branding'
import Unkash from './pages/Unkash'

// Admin pages
import AdminCentral from './pages/admin/AdminCentral'

// Components
import { AdminRoute } from './components/AdminRoute'
import { Loader2 } from 'lucide-react'

function App() {
  const { user, loading } = useAuth()

  console.log('App rendered - User:', user?.email, 'Loading:', loading)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#100C1F] via-[#0D0A18] to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-white">Carregando Conexão UNK...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100C1F] via-[#0D0A18] to-black">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        
        {/* Protected routes */}
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/agenda" element={user ? <Agenda /> : <Navigate to="/login" replace />} />
        <Route path="/projetos" element={user ? <Projetos /> : <Navigate to="/login" replace />} />
        <Route path="/self-care" element={user ? <SelfCare /> : <Navigate to="/login" replace />} />
        <Route path="/unk" element={user ? <UNK /> : <Navigate to="/login" replace />} />
        <Route path="/branding" element={user ? <Branding /> : <Navigate to="/login" replace />} />
        <Route path="/unkash" element={user ? <Unkash /> : <Navigate to="/login" replace />} />
        
        {/* Admin routes */}
        <Route 
          path="/admin/central" 
          element={
            user ? (
              <AdminRoute>
                <AdminCentral />
              </AdminRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Mobile menu - only show when user is logged in */}
      {user && <IPhoneMenu />}
    </div>
  )
}

export default App