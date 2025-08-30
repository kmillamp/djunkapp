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

interface TaskFormProps {
  onTaskAdded: () => void;
}

export const TaskForm = ({ onTaskAdded }: TaskFormProps) => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    deadline: '',
    shared_with_admin: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user?.id,
          title: formData.title,
          priority: formData.priority,
          deadline: formData.deadline || null,
          shared_with_admin: formData.shared_with_admin
        });

      if (error) throw error;
      
      toast.success('Tarefa criada com sucesso!');
      setFormData({
        title: '',
        priority: 'medium',
        deadline: '',
        shared_with_admin: false
      });
      setIsOpen(false);
      onTaskAdded();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="warning" size="sm">
          <Plus size={16} className="mr-2" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Título *</label>
            <Input
              placeholder="Digite o título da tarefa"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? 'Criando...' : 'Criar Tarefa'}
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