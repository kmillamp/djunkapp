import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/unk-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GoalFormProps {
  onGoalAdded: () => void;
}

export const GoalForm = ({ onGoalAdded }: GoalFormProps) => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: 100,
    priority: 'medium' as 'high' | 'medium' | 'low',
    deadline: '',
    shared_with_admin: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.target <= 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user?.id,
          title: formData.title,
          description: formData.description || null,
          target: formData.target,
          priority: formData.priority,
          deadline: formData.deadline || null,
          shared_with_admin: formData.shared_with_admin,
          current: 0
        });

      if (error) throw error;
      
      toast.success('Meta profissional criada com sucesso!');
      setFormData({
        title: '',
        description: '',
        target: 100,
        priority: 'medium',
        deadline: '',
        shared_with_admin: false
      });
      setIsOpen(false);
      onGoalAdded();
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="warning" size="sm">
          <Plus size={16} className="mr-2" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Meta Profissional</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Título da Meta *</label>
            <Input
              placeholder="Ex: Produzir 10 faixas este mês"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Descrição</label>
            <Textarea
              placeholder="Descreva detalhes sobre sua meta"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Meta (quantidade) *</label>
              <Input
                type="number"
                min="1"
                placeholder="100"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Data de Prazo</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          {!isAdmin && (
            <div className="flex items-center space-x-2">
              <Switch
                id="share-admin"
                checked={formData.shared_with_admin}
                onCheckedChange={(checked) => setFormData({ ...formData, shared_with_admin: checked })}
              />
              <label htmlFor="share-admin" className="text-sm font-medium">
                Compartilhar com administrador
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || !formData.title.trim() || formData.target <= 0}>
              {loading ? 'Criando...' : 'Criar Meta'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};