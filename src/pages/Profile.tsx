import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Save,
  Loader2,
  Instagram,
  Youtube,
  Music
} from 'lucide-react'
import { Button } from '@/components/ui/unk-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { GlassCard } from '@/components/ui/glass-card'
import { IPhoneMenu } from '@/components/IPhoneMenu'
import { toast } from 'sonner'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, updateProfile, uploadAvatar, signOut, isAdmin } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    artist_name: profile?.artist_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    birth_date: profile?.birth_date || '',
    pix_key: profile?.pix_key || '',
    portfolio_url: profile?.portfolio_url || '',
    instagram_url: profile?.instagram_url || '',
    youtube_url: profile?.youtube_url || '',
    soundcloud_url: profile?.soundcloud_url || '',
    presskit_url: profile?.presskit_url || ''
  })

  console.log('Profile page loaded for user:', user?.email)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      console.log('Saving profile data:', formData)
      await updateProfile(formData)
      setEditing(false)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      console.log('Uploading avatar:', file.name)
      await uploadAvatar(file)
      toast.success('Foto atualizada com sucesso!')
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Erro ao fazer upload da foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('Logging out user')
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Meu Perfil</h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <GlassCard className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                <AvatarFallback className="bg-purple-500/20 text-purple-300 text-xl font-semibold">
                  {getInitials(profile?.full_name || user?.email || 'DJ')}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              {profile?.artist_name || profile?.full_name || 'DJ'}
            </h2>
            {profile?.artist_name && profile?.full_name && (
              <p className="text-gray-400 text-sm">{profile.full_name}</p>
            )}
            <p className="text-gray-500 text-sm">{user?.email}</p>

            {isAdmin && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Administrador
                </span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Personal Information */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
            <Button
              onClick={() => editing ? handleSave() : setEditing(true)}
              size="sm"
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : editing ? (
                <Save className="w-4 h-4 mr-1" />
              ) : (
                <User className="w-4 h-4 mr-1" />
              )}
              {editing ? 'Salvar' : 'Editar'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo
                </label>
                {editing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <p className="text-white p-2">{profile?.full_name || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Artístico
                </label>
                {editing ? (
                  <Input
                    value={formData.artist_name}
                    onChange={(e) => handleInputChange('artist_name', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Seu nome artístico"
                  />
                ) : (
                  <p className="text-white p-2">{profile?.artist_name || 'Não informado'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone
                </label>
                {editing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <p className="text-white p-2">{profile?.phone || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Localização
                </label>
                {editing ? (
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Cidade, Estado"
                  />
                ) : (
                  <p className="text-white p-2">{profile?.location || 'Não informado'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biografia
              </label>
              {editing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                />
              ) : (
                <p className="text-white p-2">{profile?.bio || 'Nenhuma biografia adicionada'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Nascimento
              </label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white p-2">
                  {profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Financial Information */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Informações Financeiras</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chave PIX
            </label>
            {editing ? (
              <Input
                value={formData.pix_key}
                onChange={(e) => handleInputChange('pix_key', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Sua chave PIX (CPF, email, telefone ou chave aleatória)"
              />
            ) : (
              <p className="text-white p-2 font-mono text-sm">
                {profile?.pix_key || 'Não informado'}
              </p>
            )}
          </div>
        </GlassCard>

        {/* Logout Button */}
        <div className="text-center pt-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            Sair da Conta
          </Button>
        </div>
      </div>

      <IPhoneMenu />
    </div>
  )
}