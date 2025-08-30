import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Plus, CheckSquare, Music, Instagram, Target, FileText } from 'lucide-react'
import { Button } from '@/components/ui/unk-button'
import { GlassCard } from '@/components/ui/glass-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IPhoneMenu } from '@/components/IPhoneMenu'

export default function Projetos() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100C1F] to-black text-white p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Projetos
        </h1>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-1" />
          Novo
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="tasks" className="text-xs">
              <CheckSquare className="w-4 h-4 mr-1" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="music" className="text-xs">
              <Music className="w-4 h-4 mr-1" />
              Música
            </TabsTrigger>
            <TabsTrigger value="instagram" className="text-xs">
              <Instagram className="w-4 h-4 mr-1" />
              IG
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">
              <Target className="w-4 h-4 mr-1" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs">
              <FileText className="w-4 h-4 mr-1" />
              Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <GlassCard className="p-6 text-center">
              <CheckSquare className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
              <h2 className="text-xl font-semibold mb-2">Tarefas</h2>
              <p className="text-gray-400">
                Criação e acompanhamento de tarefas com status e prazos
              </p>
            </GlassCard>
          </TabsContent>

          <TabsContent value="music">
            <GlassCard className="p-6 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-xl font-semibold mb-2">Projetos Musicais</h2>
              <p className="text-gray-400">
                Gestão de progresso e status dos seus projetos musicais
              </p>
            </GlassCard>
          </TabsContent>

          <TabsContent value="instagram">
            <GlassCard className="p-6 text-center">
              <Instagram className="w-16 h-16 mx-auto mb-4 text-pink-400" />
              <h2 className="text-xl font-semibold mb-2">Posts do Instagram</h2>
              <p className="text-gray-400">
                Ideias de post para aprovação do admin e gerenciamento de conteúdo
              </p>
            </GlassCard>
          </TabsContent>

          <TabsContent value="goals">
            <GlassCard className="p-6 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="text-xl font-semibold mb-2">Metas</h2>
              <p className="text-gray-400">
                Definição de objetivos com métricas e prazos
              </p>
            </GlassCard>
          </TabsContent>

          <TabsContent value="docs">
            <GlassCard className="p-6 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-xl font-semibold mb-2">Documentos</h2>
              <p className="text-gray-400">
                Upload e organização de arquivos com compartilhamento admin
              </p>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>

      <IPhoneMenu />
    </div>
  )
}