import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Users, Settings, BarChart3, FileText, Shield } from 'lucide-react'
import { Button } from '@/components/ui/unk-button'
import { GlassCard } from '@/components/ui/glass-card'
import { IPhoneMenu } from '@/components/IPhoneMenu'

export default function AdminCentral() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-black">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] text-white p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Central Administrativa
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Painel de Controle</h2>
              <p className="text-sm text-muted-foreground">
                Acesso completo às funcionalidades administrativas
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-semibold">Gestão de Usuários</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Criar, editar e gerenciar contas de DJs
            </p>
            <Button variant="outline" className="w-full">
              Gerenciar Usuários
            </Button>
          </GlassCard>

          <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-semibold">Relatórios</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Métricas e análises do sistema
            </p>
            <Button variant="outline" className="w-full">
              Ver Relatórios
            </Button>
          </GlassCard>

          <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-yellow-400" />
              <h3 className="text-lg font-semibold">Prospecção</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Gerenciar leads e novos contatos
            </p>
            <Button variant="outline" className="w-full">
              Prospecção
            </Button>
          </GlassCard>

          <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-semibold">Configurações</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Configurações gerais do sistema
            </p>
            <Button variant="outline" className="w-full">
              Configurar
            </Button>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estatísticas Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-sm text-gray-400">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0</div>
              <div className="text-sm text-gray-400">Eventos Este Mês</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">0</div>
              <div className="text-sm text-gray-400">Projetos Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">R$ 0</div>
              <div className="text-sm text-gray-400">Receita Total</div>
            </div>
          </div>
        </GlassCard>
      </div>

      <IPhoneMenu />
    </div>
  )
}