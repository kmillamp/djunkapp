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

interface MusicProjectFormProps {
  onProjectAdded: () => void;
}

export const MusicProjectForm = ({ onProjectAdded }: MusicProjectFormProps) => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project_type: 'outro' as 'remix' | 'mashup' | 'set' | 'outro',
    participants: '',
    description: '',
    deadline: '',
    shared_with_admin: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('music_projects')
        .insert({
          user_id: user?.id,
          name: formData.name,
          project_type: formData.project_type,
          participants: formData.participants || null,
          description: formData.description || null,
          deadline: formData.deadline || null,
          shared_with_admin: formData.shared_with_admin
        });

      if (error) throw error;
      
      toast.success('Projeto musical criado com sucesso!');
      setFormData({
        name: '',
        project_type: 'outro',
        participants: '',
        description: '',
        deadline: '',
        shared_with_admin: false
      });
      setIsOpen(false);
      onProjectAdded();
    } catch (error) {
      console.error('Erro ao criar projeto musical:', error);
      toast.error('Erro ao criar projeto musical');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="warning" size="sm">
          <Plus size={16} className="mr-2" />
          Novo Projeto Musical
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto Musical</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Nome do Projeto *</label>
            <Input
              placeholder="Digite o nome do projeto"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Projeto</label>
            <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remix">Remix</SelectItem>
                <SelectItem value="mashup">Mashup</SelectItem>
                <SelectItem value="set">Set</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Participantes</label>
            <Input
              placeholder="Nome dos participantes (além de você)"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Descrição</label>
            <Textarea
              placeholder="Descreva seu projeto musical"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
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
                Enviar ao administrador
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Criando...' : 'Criar Projeto'}
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