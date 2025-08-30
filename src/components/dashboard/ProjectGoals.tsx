import { useState, useEffect } from "react";
import { Target, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/unk-button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// Interface para uma meta
interface Goal {
  id: string;
  status: string; // ex: 'completed', 'in_progress'
}

export const ProjectGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;

      try {
        // Para agora, vamos usar dados mock
        // Posteriormente isso virá do Supabase
        const mockGoals = [
          { id: '1', status: 'completed' },
          { id: '2', status: 'in_progress' },
          { id: '3', status: 'completed' },
          { id: '4', status: 'in_progress' },
          { id: '5', status: 'completed' }
        ];

        setGoals(mockGoals);
      } catch (err) {
        console.error("Erro geral ao buscar metas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalGoals = goals.length;
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-success" />
          <h3 className="font-semibold text-foreground">Metas & Progresso</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted/20 rounded-full w-3/4 mx-auto"></div>
          <div className="h-8 bg-muted/20 rounded-lg"></div>
          <div className="h-10 bg-muted/20 rounded-lg"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-success" />
          <h3 className="font-semibold text-foreground">Metas & Progresso</h3>
        </div>

        {totalGoals > 0 ? (
          <div>
            <div className="text-center mb-3">
              <p className="text-sm text-muted-foreground">Você completou</p>
              <p className="text-2xl font-bold text-foreground">{completedGoals} de {totalGoals} metas</p>
            </div>
            <Progress 
              value={progressPercentage} 
              className="w-full h-2" 
              indicatorClassName="bg-success" 
            />
          </div>
        ) : (
          <div className="text-center py-3">
            <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h4 className="font-medium text-foreground mb-1">Defina suas metas</h4>
            <p className="text-sm text-muted-foreground">
              Crie metas para acompanhar seu progresso.
            </p>
          </div>
        )}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate('/projetos')}
        className="w-full mt-4"
      >
        <span>Gerenciar Projetos e Metas</span>
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </GlassCard>
  );
};