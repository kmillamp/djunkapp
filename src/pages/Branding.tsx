import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/unk-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlassCard } from '@/components/ui/glass-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Palette, MessageSquare, User, Target, Save, Camera, ArrowLeft, Plus, Edit, Trash2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { LogoUpload } from '@/components/branding/LogoUpload'

interface BrandColor {
  name: string
  color: string
  usage: string
}

interface BrandingConfig {
  id?: string
  user_id: string
  brand_colors: BrandColor[]
  communication_traits: string
  personality_traits: string
  core_values: string
  mission: string
  logo_url?: string
}

interface UserProfile {
  id: string
  full_name: string
  artist_name: string
  email: string
}

interface ActionPlan {
  id?: string
  user_id: string
  title: string
  description: string
  goals: string
  strategies: string
  timeline: string
  metrics: string
}

export default function Branding() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>(user?.id || '')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  // Brand configuration states
  const [brandColors, setBrandColors] = useState<BrandColor[]>([
    { name: "Primária", color: "#3B82F6", usage: "Logo e elementos principais" },
    { name: "Secundária", color: "#8B5CF6", usage: "Destaques e acentos" }
  ])
  const [communicationStyle, setCommunicationStyle] = useState("")
  const [personalityTraits, setPersonalityTraits] = useState("")
  const [coreValues, setCoreValues] = useState("")
  const [mission, setMission] = useState("")
  const [logoUrl, setLogoUrl] = useState<string>('')

  // Action plans states
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([])
  const [isEditingPlan, setIsEditingPlan] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<ActionPlan>({
    user_id: selectedUserId,
    title: '',
    description: '',
    goals: '',
    strategies: '',
    timeline: '',
    metrics: ''
  })

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        loadUsers()
      } else {
        setSelectedUserId(user.id)
        loadBrandingConfig(user.id)
      }
    }
  }, [user, isAdmin])

  useEffect(() => {
    if (selectedUserId) {
      loadBrandingConfig(selectedUserId)
      loadActionPlans(selectedUserId)
      if (isAdmin) {
        const userProfile = users.find(u => u.id === selectedUserId)
        setSelectedUser(userProfile || null)
      }
    }
  }, [selectedUserId, users])

  const loadUsers = async () => {
    if (!isAdmin) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, artist_name, email')
        .order('full_name')

      if (error) throw error
      setUsers(data || [])

      // Set first user as default if none selected
      if (data && data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Erro ao carregar usuários')
    }
  }

  const loadBrandingConfig = async (userId: string) => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('branding_configs')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setBrandColors(Array.isArray(data.brand_colors) ? data.brand_colors as unknown as BrandColor[] : [
          { name: "Primária", color: "#3B82F6", usage: "Logo e elementos principais" },
          { name: "Secundária", color: "#8B5CF6", usage: "Destaques e acentos" }
        ])
        setCommunicationStyle(String(data.communication_traits || ''))
        setPersonalityTraits(data.personality_traits || '')
        setCoreValues(data.core_values || '')
        setMission(data.mission || '')
        setLogoUrl(data.logo_url || '')
      } else {
        // Reset to defaults if no config found
        setBrandColors([
          { name: "Primária", color: "#3B82F6", usage: "Logo e elementos principais" },
          { name: "Secundária", color: "#8B5CF6", usage: "Destaques e acentos" }
        ])
        setCommunicationStyle('')
        setPersonalityTraits('')
        setCoreValues('')
        setMission('')
        setLogoUrl('')
      }
    } catch (error) {
      console.error('Error loading branding config:', error)
      toast.error('Erro ao carregar configuração')
    } finally {
      setLoading(false)
    }
  }

  const loadActionPlans = async (userId: string) => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('branding_action_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setActionPlans(data || [])
    } catch (error) {
      console.error('Error loading action plans:', error)
      toast.error('Erro ao carregar planos de ação')
    }
  }

  const saveActionPlan = async () => {
    if (!selectedUserId) return

    try {
      const planData = {
        user_id: selectedUserId,
        title: currentPlan.title,
        description: currentPlan.description,
        goals: currentPlan.goals,
        strategies: currentPlan.strategies,
        timeline: currentPlan.timeline,
        metrics: currentPlan.metrics
      }

      if (currentPlan.id) {
        const { error } = await supabase
          .from('branding_action_plans')
          .update(planData)
          .eq('id', currentPlan.id)

        if (error) throw error
        toast.success('Plano de ação atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('branding_action_plans')
          .insert([planData])

        if (error) throw error
        toast.success('Plano de ação criado com sucesso!')
      }

      setIsEditingPlan(false)
      setCurrentPlan({
        user_id: selectedUserId,
        title: '',
        description: '',
        goals: '',
        strategies: '',
        timeline: '',
        metrics: ''
      })
      loadActionPlans(selectedUserId)
    } catch (error) {
      console.error('Error saving action plan:', error)
      toast.error('Erro ao salvar plano de ação')
    }
  }

  const deleteActionPlan = async (planId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano de ação?')) return

    try {
      const { error } = await supabase
        .from('branding_action_plans')
        .delete()
        .eq('id', planId)

      if (error) throw error
      toast.success('Plano de ação excluído com sucesso!')
      loadActionPlans(selectedUserId)
    } catch (error) {
      console.error('Error deleting action plan:', error)
      toast.error('Erro ao excluir plano de ação')
    }
  }

  const startEditingPlan = (plan: ActionPlan) => {
    setCurrentPlan(plan)
    setIsEditingPlan(true)
  }

  const cancelEditing = () => {
    setIsEditingPlan(false)
    setCurrentPlan({
      user_id: selectedUserId,
      title: '',
      description: '',
      goals: '',
      strategies: '',
      timeline: '',
      metrics: ''
    })
  }

  const saveBrandingConfig = async () => {
    if (!selectedUserId) return

    setSaving(true)
    try {
      const brandingData = {
        user_id: selectedUserId,
        brand_colors: brandColors as any,
        communication_traits: communicationStyle as any,
        personality_traits: personalityTraits,
        core_values: coreValues,
        mission: mission,
        logo_url: logoUrl
      }

      const { error } = await supabase
        .from('branding_configs')
        .upsert(brandingData, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Configuração salva com sucesso!')
    } catch (error) {
      console.error('Error saving branding config:', error)
      toast.error('Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const updateColor = (index: number, field: keyof BrandColor, value: string) => {
    const updated = [...brandColors]
    updated[index][field] = value
    setBrandColors(updated)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#100C1F] via-[#0D0A18] to-black p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl text-white">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100C1F] via-[#0D0A18] to-black p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Branding</h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Branding
            </h1>
            <p className="text-gray-400">
              {isAdmin ? 'Gerencie a identidade artística dos DJs' : 'Sua identidade artística'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Editando:</span>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-[200px] bg-black/20 border-white/10 text-white">
                    <SelectValue placeholder="Selecionar DJ" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-white">
                        {user.artist_name || user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {isAdmin && (
              <Button
                onClick={saveBrandingConfig}
                variant="hero"
                disabled={saving}
              >
                {saving ? 'Salvando...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {selectedUser && (
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {(selectedUser.artist_name || selectedUser.full_name).charAt(0)}
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {selectedUser.artist_name || selectedUser.full_name}
                </h3>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
              </div>
            </div>
          </GlassCard>
        )}

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 border border-white/10">
            <TabsTrigger value="identity" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Palette className="w-4 h-4 mr-1" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
              <MessageSquare className="w-4 h-4 mr-1" />
              Comunicação
            </TabsTrigger>
            <TabsTrigger value="personality" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <User className="w-4 h-4 mr-1" />
              Personalidade
            </TabsTrigger>
            <TabsTrigger value="action-plans" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300">
              <Target className="w-4 h-4 mr-1" />
              Planos de Ação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Identidade Visual</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {isAdmin ? (
                    <LogoUpload 
                      currentLogoUrl={logoUrl}
                      onLogoChange={setLogoUrl}
                    />
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Logo Principal</h4>
                      <div 
                        className={`w-32 h-32 rounded-lg overflow-hidden ${
                          logoUrl && logoUrl.endsWith('.png') 
                            ? 'bg-transparent border-2 border-dashed border-white/30' 
                            : 'bg-gradient-to-br from-purple-500 to-blue-500'
                        }`}
                      >
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt="Logo" 
                            className={`w-full h-full ${
                              logoUrl.endsWith('.png') ? 'object-contain' : 'object-cover'
                            }`}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <img 
                              src="https://cdn-ai.onspace.ai/onspace/project/image/V5j9ZGwC3uAZAUzESUnBUb/u_branco.png" 
                              alt="CONEXÃO UNK" 
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Paleta de Cores</h4>
                  <div className="space-y-3">
                    {brandColors.slice(0, 2).map((color, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 border-white/10"
                          style={{ backgroundColor: color.color }}
                        />
                        <div className="flex-1">
                          {isAdmin ? (
                            <Input
                              value={color.name}
                              onChange={(e) => updateColor(index, 'name', e.target.value)}
                              className="h-9 text-sm font-medium bg-white/5 border-white/10 text-white"
                            />
                          ) : (
                            <p className="text-white font-medium">{color.name}</p>
                          )}
                        </div>
                        {isAdmin ? (
                          <Input
                            type="color"
                            value={color.color}
                            onChange={(e) => updateColor(index, 'color', e.target.value)}
                            className="w-16 h-9 p-1 bg-white/5 border-white/10"
                          />
                        ) : (
                          <span className="text-sm text-gray-400 font-mono">{color.color}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Tom de Comunicação</h3>

              <div className="space-y-4">
                <label className="text-sm font-medium text-white block">
                  Características de Comunicação
                </label>
                {isAdmin ? (
                  <Textarea
                    value={communicationStyle}
                    onChange={(e) => setCommunicationStyle(e.target.value)}
                    placeholder="Descreva o estilo de comunicação..."
                    className="min-h-[120px] bg-white/5 border-white/10 text-white"
                  />
                ) : (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white">
                      {communicationStyle || 'Nenhuma configuração de comunicação definida ainda.'}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="personality" className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Personalidade Artística</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Traços de Personalidade</h4>
                  {isAdmin ? (
                    <Textarea
                      value={personalityTraits}
                      onChange={(e) => setPersonalityTraits(e.target.value)}
                      placeholder="Descreva os traços de personalidade..."
                      className="min-h-[80px] bg-white/5 border-white/10 text-white"
                    />
                  ) : (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white">
                        {personalityTraits || 'Nenhum traço de personalidade definido ainda.'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Valores Centrais</h4>
                  {isAdmin ? (
                    <Textarea
                      value={coreValues}
                      onChange={(e) => setCoreValues(e.target.value)}
                      placeholder="Quais são seus valores principais?"
                      className="min-h-[80px] bg-white/5 border-white/10 text-white"
                    />
                  ) : (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white">
                        {coreValues || 'Nenhum valor central definido ainda.'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Missão</h4>
                  {isAdmin ? (
                    <Textarea
                      value={mission}
                      onChange={(e) => setMission(e.target.value)}
                      placeholder="Qual é sua missão como artista?"
                      className="min-h-[80px] bg-white/5 border-white/10 text-white"
                    />
                  ) : (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white">
                        {mission || 'Nenhuma missão definida ainda.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="action-plans" className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Planos de Ação</h3>
                {isAdmin && (
                  <Button
                    onClick={() => setIsEditingPlan(true)}
                    variant="hero"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </Button>
                )}
              </div>

              {isEditingPlan && isAdmin && (
                <div className="mb-6 p-4 border border-white/10 rounded-lg bg-black/20">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white block mb-2">
                        Título do Plano
                      </label>
                      <Input
                        value={currentPlan.title}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, title: e.target.value })}
                        placeholder="Ex: Estratégia de Branding 2024"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white block mb-2">
                        Descrição
                      </label>
                      <Textarea
                        value={currentPlan.description}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                        placeholder="Descreva o plano de ação..."
                        className="min-h-[80px] bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-white block mb-2">
                          Objetivos
                        </label>
                        <Textarea
                          value={currentPlan.goals}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, goals: e.target.value })}
                          placeholder="Quais são os objetivos?"
                          className="min-h-[100px] bg-white/5 border-white/10 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-white block mb-2">
                          Estratégias
                        </label>
                        <Textarea
                          value={currentPlan.strategies}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, strategies: e.target.value })}
                          placeholder="Como alcançar os objetivos?"
                          className="min-h-[100px] bg-white/5 border-white/10 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-white block mb-2">
                          Cronograma
                        </label>
                        <Textarea
                          value={currentPlan.timeline}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, timeline: e.target.value })}
                          placeholder="Quando executar cada etapa?"
                          className="min-h-[100px] bg-white/5 border-white/10 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-white block mb-2">
                          Métricas
                        </label>
                        <Textarea
                          value={currentPlan.metrics}
                          onChange={(e) => setCurrentPlan({ ...currentPlan, metrics: e.target.value })}
                          placeholder="Como medir o sucesso?"
                          className="min-h-[100px] bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={saveActionPlan}
                        variant="hero"
                        disabled={!currentPlan.title}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {currentPlan.id ? 'Atualizar' : 'Salvar'} Plano
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {actionPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">
                      {isAdmin ? 'Nenhum plano de ação criado ainda.' : 'Nenhum plano de ação definido ainda.'}
                    </p>
                  </div>
                ) : (
                  actionPlans.map((plan) => (
                    <div key={plan.id} className="p-4 border border-white/10 rounded-lg bg-black/10">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-white font-semibold">{plan.title}</h4>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startEditingPlan(plan)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deleteActionPlan(plan.id!)}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {plan.description && (
                        <p className="text-gray-300 mb-4">{plan.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {plan.goals && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Objetivos:</h5>
                            <p className="text-gray-300">{plan.goals}</p>
                          </div>
                        )}
                        
                        {plan.strategies && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Estratégias:</h5>
                            <p className="text-gray-300">{plan.strategies}</p>
                          </div>
                        )}
                        
                        {plan.timeline && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Cronograma:</h5>
                            <p className="text-gray-300">{plan.timeline}</p>
                          </div>
                        )}
                        
                        {plan.metrics && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Métricas:</h5>
                            <p className="text-gray-300">{plan.metrics}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}