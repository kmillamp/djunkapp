import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Plus, Edit, Trash2, Mail, Phone, MapPin, Calendar, ExternalLink, Crown, Headphones } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/unk-button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DJ {
  id: string;
  full_name: string;
  artist_name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  birth_date: string;
  pix_key: string;
  portfolio_url: string;
  instagram_url: string;
  youtube_url: string;
  soundcloud_url: string;
  presskit_url: string;
  is_admin: boolean;
  avatar_url?: string;
  created_at: string;
}

const Usuarios: React.FC = () => {
  const navigate = useNavigate();
  const [djs, setDjs] = useState<DJ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDJs();
  }, []);

  const loadDJs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar lista de usuários');
        return;
      }

      const formattedDJs: DJ[] = (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || '',
        artist_name: profile.artist_name || '',
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        birth_date: profile.birth_date || '',
        pix_key: profile.pix_key || '',
        portfolio_url: profile.portfolio_url || '',
        instagram_url: profile.instagram_url || '',
        youtube_url: profile.youtube_url || '',
        soundcloud_url: profile.soundcloud_url || '',
        presskit_url: profile.presskit_url || '',
        is_admin: profile.is_admin || false,
        avatar_url: profile.avatar_url || '',
        created_at: profile.created_at || ''
      }));

      setDjs(formattedDJs);
    } catch (error) {
      console.error('Erro ao carregar DJs:', error);
      toast.error('Erro ao carregar lista de DJs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o DJ ${name}?`)) return;

    // Simular exclusão
    setDjs(prev => prev.filter(dj => dj.id !== id));
    toast.success(`DJ ${name} removido com sucesso!`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-foreground">Carregando DJs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/central')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <Users className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            DJs Cadastrados ({djs.length})
          </h1>
        </div>
        
        <Button
          onClick={() => navigate('/admin/cadastro-djs')}
          variant="hero"
        >
          <Plus className="w-4 h-4 mr-1" /> Novo DJ
        </Button>
      </div>

      {/* Lista de DJs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {djs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum DJ cadastrado ainda.</p>
            <Button 
              onClick={() => navigate('/admin/cadastro-djs')}
              variant="hero"
              className="mt-4"
            >
              Cadastrar Primeiro DJ
            </Button>
          </div>
        ) : (
          djs.map((dj) => (
            <GlassCard key={dj.id} variant="primary" className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={dj.avatar_url} alt={dj.full_name} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {getInitials(dj.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Badge de identificação */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    {dj.is_admin ? (
                      <Crown className="w-3 h-3 text-primary-foreground" />
                    ) : (
                      <Headphones className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {dj.full_name}
                      </h3>
                      {dj.artist_name && (
                        <p className="text-primary font-medium">"{dj.artist_name}"</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-2">
                      {dj.is_admin && (
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {dj.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {dj.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{dj.email}</span>
                </div>
                
                {dj.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{dj.phone}</span>
                  </div>
                )}
                
                {dj.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{dj.location}</span>
                  </div>
                )}
                
                {dj.birth_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{calculateAge(dj.birth_date)} anos</span>
                  </div>
                )}
              </div>

              {/* Links Sociais */}
              {(dj.portfolio_url || dj.instagram_url || dj.youtube_url || dj.soundcloud_url) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {dj.portfolio_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a href={dj.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                  
                  {dj.instagram_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a href={dj.instagram_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  
                  {dj.youtube_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a href={dj.youtube_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        YouTube
                      </a>
                    </Button>
                  )}

                  {dj.soundcloud_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <a href={dj.soundcloud_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        SoundCloud
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Cadastrado em {formatDate(dj.created_at)}
                </span>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Em produção, navegaria para página de edição
                      toast.info(`Editando perfil de ${dj.full_name}`);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(dj.id, dj.full_name)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Usuarios;