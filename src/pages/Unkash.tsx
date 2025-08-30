import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/unk-button'
import { GlassCard } from '@/components/ui/glass-card'
import { IPhoneMenu } from '@/components/IPhoneMenu'

export default function Unkash() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Unkash
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard className="p-6 text-center">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h2 className="text-2xl font-semibold mb-4">Sistema Financeiro</h2>
          <p className="text-gray-300 mb-6">
            Gerencie seus cachês, receitas e controle financeiro em um só lugar
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-semibold">Cachês Pendentes</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Acompanhe os pagamentos de eventos confirmados
            </p>
            <div className="text-2xl font-bold text-green-400">R$ 0,00</div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-semibold">Receita Mensal</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Total recebido neste mês
            </p>
            <div className="text-2xl font-bold text-blue-400">R$ 0,00</div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-semibold">Gastos</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Controle de despesas mensais
            </p>
            <div className="text-2xl font-bold text-purple-400">R$ 0,00</div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <h3 className="text-lg font-semibold">Saldo Total</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Balanço geral das suas finanças
            </p>
            <div className="text-2xl font-bold text-yellow-400">R$ 0,00</div>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Próximas Funcionalidades</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Integração automática com eventos confirmados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Relatórios mensais e anuais</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Controle de gastos por categoria</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Metas financeiras e economia</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <IPhoneMenu />
    </div>
  )
}