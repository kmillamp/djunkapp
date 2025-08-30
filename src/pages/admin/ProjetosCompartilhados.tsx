import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Music, Instagram, FileText, User, Calendar, Share2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/unk-button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SharedProject {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'music' | 'instagram' | 'goal' | 'document';
  status: string;
  priority: string;
  deadline: string | null;
  created_at: string;
  user_id: string;
  user?: {
    full_name: string;
    artist_name: string;
    email: string;
  };
}

const ProjetosCompartilhados: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<SharedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<SharedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  // Filtros
  const [filters, setFilters] = useState({
    userFilter: 'all', // 'all', 'own', ou user_id específico
    typeFilter: 'all',
    statusFilter: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar usuários para o filtro
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, artist_name, email')
        .order('full_name');

      setUsers(usersData || []);

      // Carregar todos os projetos (admin tem acesso a tudo)
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (
            full_name,
            artist_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar projetos:', error);
        toast.error('Erro ao carregar projetos');
        return;
      }

      const formattedProjects: SharedProject[] = (projectsData || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description || '',
        type: (project.type as SharedProject['type']) || 'task',
        status: project.status || 'todo',
        priority: project.priority || 'medium',
        deadline: project.deadline,
        created_at: project.created_at,
        user_id: project.user_id,
        user: Array.isArray(project.profiles) ? project.profiles[0] : project.profiles
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Filtro por usuário
    if (filters.userFilter === 'own') {
      filtered = filtered.filter(project => project.user_id === user?.id);
    } else if (filters.userFilter !== 'all') {
      filtered = filtered.filter(project => project.user_id === filters.userFilter);
    }

    // Filtro por tipo
    if (filters.typeFilter !== 'all') {
      filtered = filtered.filter(project => project.type === filters.typeFilter);
    }

    // Filtro por status
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === filters.statusFilter);
    }

    // Filtro por termo de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.user?.full_name?.toLowerCase().includes(searchLower) ||
        project.user?.artist_name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProjects(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task': return 'Tarefa';
      case 'music': return 'Projeto Musical';
      case 'instagram': return 'Post Instagram';
      case 'goal': return 'Meta Pessoal';
      case 'document': return 'Documento';
      default: return 'Projeto Geral';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'planning': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Progresso';
      case 'planning': return 'Planejamento';
      case 'todo': return 'A Fazer';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-foreground">Carregando projetos compartilhados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/admin/central')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Todos os Projetos
        </h1>
        <div></div>
      </div>

      {/* Filtros */}
      <GlassCard variant="primary" className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Usuário</label>
            <Select value={filters.userFilter} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, userFilter: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Todos os usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                <SelectItem value="own">Meus projetos</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.artist_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo</label>
            <Select value={filters.typeFilter} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, typeFilter: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="task">Tarefa</SelectItem>
                <SelectItem value="music">Projeto Musical</SelectItem>
                <SelectItem value="instagram">Post Instagram</SelectItem>
                <SelectItem value="goal">Meta Pessoal</SelectItem>
                <SelectItem value="document">Documento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <Select value={filters.statusFilter} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, statusFilter: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="todo">A Fazer</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Buscar</label>
            <Input
              type="text"
              placeholder="Buscar por título, descrição ou usuário..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => setFilters({ userFilter: 'all', typeFilter: 'all', statusFilter: 'all', searchTerm: '' })}
            variant="outline"
            size="sm"
          >
            Limpar Filtros
          </Button>
          <Badge variant="secondary">
            {filteredProjects.length} projeto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </GlassCard>

      {/* Lista de Projetos */}
      {filteredProjects.length === 0 ? (
        <GlassCard variant="primary" className="text-center py-12">
          <Share2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground">
            {projects.length === 0 
              ? 'Nenhum projeto foi criado ainda.' 
              : 'Nenhum projeto corresponde aos filtros aplicados.'
            }
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map(project => (
            <GlassCard key={project.id} variant="primary" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(project.type)}
                  <span className="text-sm text-muted-foreground">
                    {getTypeLabel(project.type)}
                  </span>
                </div>
                <Badge className={`${getStatusColor(project.status)} text-xs`}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                {project.title}
              </h3>

              {project.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>
                    {project.user?.full_name || project.user?.artist_name || project.user?.email}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {formatDate(project.created_at)}</span>
                </div>

                {project.deadline && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Prazo: {formatDate(project.deadline)}</span>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjetosCompartilhados;