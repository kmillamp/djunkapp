import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Shield } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin } = useAuth()

  console.log('AdminRoute - User:', user?.email, 'Admin:', isAdmin, 'Loading:', loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#100C1F] via-[#0D0A18] to-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-white">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('User not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    console.log('User not admin, redirecting to dashboard')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#100C1F] via-[#0D0A18] to-black">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400 mb-4">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-gray-500">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}