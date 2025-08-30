import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, Save, X, Trash2, Calendar, Target, CheckCircle2, Clock 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActionPlan {
  id: string;
  title: string;
  progress: number;
  deadline: string;
  user_id: string;
}

interface ActionPlanCardProps {
  plan: ActionPlan;
  onUpdate: (updatedPlan: ActionPlan) => void;
  onDelete: (planId: string) => void;
  isAdmin: boolean;
}

export function ActionPlanCard({ plan, onUpdate, onDelete, isAdmin }: ActionPlanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(plan.title);
  const [editProgress, setEditProgress] = useState(plan.progress);
  const [editDeadline, setEditDeadline] = useState(plan.deadline);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('action_plans')
        .update({
          title: editTitle,
          progress: editProgress,
          deadline: editDeadline
        })
        .eq('id', plan.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setIsEditing(false);
      toast.success('Plano atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast.error('Erro ao atualizar plano');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este plano de ação?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;

      onDelete(plan.id);
      toast.success('Plano excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast.error('Erro ao excluir plano');
    }
  };

  const handleCancel = () => {
    setEditTitle(plan.title);
    setEditProgress(plan.progress);
    setEditDeadline(plan.deadline);
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    if (plan.progress === 100) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Concluído
      </Badge>;
    }
    
    const today = new Date();
    const deadline = new Date(plan.deadline);
    const isOverdue = deadline < today && plan.progress < 100;
    
    if (isOverdue) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <Clock className="w-3 h-3 mr-1" />
        Atrasado
      </Badge>;
    }
    
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
      <Clock className="w-3 h-3 mr-1" />
      Em Progresso
    </Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <GlassCard className="relative">
      {isAdmin && (
        <div className="absolute top-4 right-4 flex space-x-2">
          {!isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                disabled={saving}
                className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between pr-20">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Título do plano de ação"
              />
            ) : (
              <h3 className="text-lg font-semibold text-foreground">{plan.title}</h3>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {getStatusBadge()}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1" />
            {isEditing ? (
              <Input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="h-8 w-auto"
              />
            ) : (
              formatDate(plan.deadline)
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Progresso</span>
            </div>
            <span className="text-sm font-medium">
              {isEditing ? editProgress : plan.progress}%
            </span>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Progress value={editProgress} className="w-full" />
              <Input
                type="range"
                min="0"
                max="100"
                step="5"
                value={editProgress}
                onChange={(e) => setEditProgress(Number(e.target.value))}
                className="w-full"
              />
            </div>
          ) : (
            <Progress value={plan.progress} className="w-full" />
          )}
        </div>
      </div>
    </GlassCard>
  );
}