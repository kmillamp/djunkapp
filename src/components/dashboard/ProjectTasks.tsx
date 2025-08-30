import { useState, useEffect } from "react";
import { CheckSquare, AlertCircle, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/unk-button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  deadline: string | null;
  priority: string;
  status: string;
}

export const ProjectTasks = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        // Para agora, vamos usar dados mock
        // Posteriormente isso virá do Supabase
        const mockProjects = [
          {
            id: '1',
            title: 'Remix do Martin Garrix - Animals',
            deadline: '2024-12-30',
            priority: 'high',
            status: 'in_progress'
          },
          {
            id: '2',
            title: 'Mashup Progressive House',
            deadline: '2024-12-28',
            priority: 'medium',
            status: 'todo'
          }
        ];

        setProjects(mockProjects);
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;

    const deadlineDate = new Date(deadline);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (deadlineDate.toDateString() === today.toDateString()) {
      return 'hoje';
    } else if (deadlineDate.toDateString() === tomorrow.toDateString()) {
      return 'amanhã';
    } else {
      return deadlineDate.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Projetos & Tarefas</h3>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-muted/20 rounded-lg"></div>
          <div className="h-16 bg-muted/20 rounded-lg"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Projetos & Tarefas</h3>
        </div>
        <Button 
          variant="glass" 
          size="sm" 
          onClick={() => navigate('/projetos')}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Nenhum projeto ativo</p>
            <p className="text-xs text-muted-foreground mt-1">Crie seu primeiro projeto</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="bg-muted/20 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-foreground">{project.title}</h4>
                <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                  {getPriorityText(project.priority)}
                </Badge>
              </div>
              {project.deadline && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3" />
                  <span>Vence {formatDeadline(project.deadline)}</span>
                </div>
              )}
            </div>
          ))
        )}

        <div className="mt-4 text-center">
          <Button 
            variant="warning" 
            size="sm" 
            onClick={() => navigate('/projetos')}
            className="text-xs bg-transparent text-teal-500"
          >
            Ver todos os projetos
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};