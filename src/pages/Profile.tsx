import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { 
  ArrowLeft, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Instagram,
  Youtube,
  Music,
  ExternalLink,
  Save,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase';


import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ImageCropper } from '@/components/ImageCropper'
import { IPhoneMenu } from '@/components/IPhoneMenu'
import { toast } from 'sonner'

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile, uploadAvatar, logout, isAdmin } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [cropperOpen, setCropperOpen] = useState(false)

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    artist_name: user?.artist_name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    birth_date: user?.birth_date || '',
    pix_key: user?.pix_key || '',
    portfolio_url: user?.portfolio_url || '',
    instagram_url: user?.instagram_url || '',
    youtube_url: user?.youtube_url || '',
    soundcloud_url: user?.soundcloud_url || '',
    presskit_url: user?.presskit_url || ''
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

  const handleCroppedImage = async (croppedImage: File) => {
    setUploadingPhoto(true)
    try {
      console.log('Uploading cropped avatar:', croppedImage.name)
      await uploadAvatar(croppedImage)
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
      await logout()
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
        <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                <AvatarFallback className="bg-purple-500/20 text-purple-300 text-xl font-semibold">
                  {getInitials(user?.full_name || user?.email || 'DJ')}
                </AvatarFallback>
              </Avatar>
              
              <button
                onClick={() => setCropperOpen(true)}
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
              {user?.artist_name || user?.full_name || 'DJ'}
            </h2>
            {user?.artist_name && user?.full_name && (
              <p className="text-gray-400 text-sm">{user.full_name}</p>
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
        </Card>

        {/* Personal Information */}
        <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
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
                  <p className="text-white p-2">{user?.full_name || 'Não informado'}</p>
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
                  <p className="text-white p-2">{user?.artist_name || 'Não informado'}</p>
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
                  <p className="text-white p-2">{user?.phone || 'Não informado'}</p>
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
                  <p className="text-white p-2">{user?.location || 'Não informado'}</p>
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
                  className="bg-white/5 border-white/10 text-white resize-none"
                  placeholder="Conte um pouco sobre você e sua música..."
                  rows={3}
                />
              ) : (
                <p className="text-white p-2">{user?.bio || 'Nenhuma biografia adicionada'}</p>
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
                  {user?.birth_date ? new Date(user.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Links and Social Media */}
        <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Links e Redes Sociais</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portfolio/Site
              </label>
              {editing ? (
                <Input
                  value={formData.portfolio_url}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="https://seusite.com"
                />
              ) : (
                <p className="text-white p-2">
                  {user?.portfolio_url ? (
                    <a 
                      href={user.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {user.portfolio_url}
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instagram
                </label>
                {editing ? (
                  <Input
                    value={formData.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="@seuusuario"
                  />
                ) : (
                  <p className="text-white p-2">
                    {user?.instagram_url ? (
                      <a 
                        href={user.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:text-pink-300 flex items-center"
                      >
                        <Instagram className="w-4 h-4 mr-1" />
                        Instagram
                      </a>
                    ) : (
                      'Não informado'
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube
                </label>
                {editing ? (
                  <Input
                    value={formData.youtube_url}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Canal do YouTube"
                  />
                ) : (
                  <p className="text-white p-2">
                    {user?.youtube_url ? (
                      <a 
                        href={user.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 flex items-center"
                      >
                        <Youtube className="w-4 h-4 mr-1" />
                        YouTube
                      </a>
                    ) : (
                      'Não informado'
                    )}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SoundCloud
              </label>
              {editing ? (
                <Input
                  value={formData.soundcloud_url}
                  onChange={(e) => handleInputChange('soundcloud_url', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Perfil do SoundCloud"
                />
              ) : (
                <p className="text-white p-2">
                  {user?.soundcloud_url ? (
                    <a 
                      href={user.soundcloud_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 flex items-center"
                    >
                      <Music className="w-4 h-4 mr-1" />
                      SoundCloud
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
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
                {user?.pix_key || 'Não informado'}
              </p>
            )}
          </div>
        </Card>

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

      <ImageCropper
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onSave={handleCroppedImage}
      />

      <IPhoneMenu />
    </div>
  )
}