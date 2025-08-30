import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Plus, Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react'
import { Button } from '@/components/ui/unk-button'
import { GlassCard } from '@/components/ui/glass-card'
import { IPhoneMenu } from '@/components/IPhoneMenu'

export default function Agenda() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
          Agenda
        </h1>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-1" />
          Novo Evento
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <GlassCard className="p-6 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-orange-400" />
          <h2 className="text-xl font-semibold mb-2">Agenda em Desenvolvimento</h2>
          <p className="text-gray-400 mb-4">
            Sistema completo de gerenciamento de eventos compartilhados entre usuários e admin.
          </p>
          <div className="text-left space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Gerenciamento de horários e descrições</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-400" />
              <span>Localização e detalhes do produtor</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span>Controle de cachê e pagamentos</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              <span>Compartilhamento com administradores</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <IPhoneMenu />
    </div>
  )
}