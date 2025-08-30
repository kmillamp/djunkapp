import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/unk-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CadastroDJs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        toast.error('Acesso não autorizado');
        navigate('/');
        return;
      }

      setIsAdmin(true);
    };

    checkAdminStatus();
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    artist_name: '',
    bio: '',
    location: '',
    birth_date: '',
    pix_key: '',
    portfolio_url: '',
    instagram_url: '',
    youtube_url: '',
    presskit_url: '',
    is_admin: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Preencha os campos obrigatórios: Nome completo, Email e Senha');
      return;
    }

    setLoading(true);
    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      // 2. Criar registro na tabela djs
      const { error: djError } = await supabase
        .from('djs')
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          artist_name: formData.artist_name || null,
          bio: formData.bio || null,
          location: formData.location || null,
          birth_date: formData.birth_date || null,
          pix_key: formData.pix_key || null,
          portfolio_url: formData.portfolio_url || null,
          instagram_url: formData.instagram_url || null,
          youtube_url: formData.youtube_url || null,
          presskit_url: formData.presskit_url || null,
          is_admin: formData.is_admin,
          auth_user_id: authData.user.id
        });

      if (djError) throw djError;
      
      toast.success('DJ cadastrado com sucesso!');
      
      // Limpar formulário
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        artist_name: '',
        bio: '',
        location: '',
        birth_date: '',
        pix_key: '',
        portfolio_url: '',
        instagram_url: '',
        youtube_url: '',
        presskit_url: '',
        is_admin: false
      });
    } catch (error: any) {
      console.error('Erro ao cadastrar DJ:', error);
      toast.error(error.message || 'Erro ao cadastrar DJ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/admin/central')}
          className="flex items-center space-x-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Cadastro de DJs
        </h1>
        <div></div>
      </div>

      <GlassCard variant="primary">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome Completo *
                </label>
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Nome completo do DJ"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome Artístico
                </label>
                <Input
                  type="text"
                  value={formData.artist_name}
                  onChange={(e) => handleInputChange('artist_name', e.target.value)}
                  placeholder="Nome artístico"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pr-10"
                    placeholder="Senha (min. 6 caracteres)"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Telefone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Data de Nascimento
                </label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Localização
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Cidade, Estado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Biografia
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="min-h-[100px]"
                placeholder="Conte um pouco sobre o DJ..."
              />
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground">
              Informações Profissionais
            </h3>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Chave PIX
              </label>
              <Input
                type="text"
                value={formData.pix_key}
                onChange={(e) => handleInputChange('pix_key', e.target.value)}
                placeholder="Chave PIX para pagamentos"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Portfolio
                </label>
                <Input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  placeholder="https://portfolio.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Instagram
                </label>
                <Input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  YouTube
                </label>
                <Input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Press Kit
                </label>
                <Input
                  type="url"
                  value={formData.presskit_url}
                  onChange={(e) => handleInputChange('presskit_url', e.target.value)}
                  placeholder="https://presskit.com"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_admin"
                checked={formData.is_admin}
                onChange={(e) => handleInputChange('is_admin', e.target.checked)}
                className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
              />
              <label htmlFor="is_admin" className="text-sm text-muted-foreground">
                Conceder privilégios de administrador
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="hero"
            size="lg"
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Cadastrando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={20} />
                Cadastrar DJ
              </div>
            )}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default CadastroDJs;