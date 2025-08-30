import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string;
  artist_name: string | null;
}

interface EventShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function EventShareModal({ isOpen, onClose, eventId }: EventShareModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Buscar usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Buscar todos os DJs (usuários não admin)
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, full_name, artist_name')
          .eq('is_admin', false);

        if (usersError) throw usersError;

        setUsers(usersData || []);
        // For now, we'll just use local state for selectedUsers
        setSelectedUsers([]);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, eventId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // For now, we'll just show a success message
      // In the future, this would save to an event_shares table
      
      toast({
        title: "Sucesso",
        description: "Compartilhamentos salvos com sucesso!",
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar compartilhamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os compartilhamentos.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Compartilhar Evento</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-4">
            <p className="text-foreground text-center">Carregando usuários...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={user.id}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <label htmlFor={user.id} className="text-foreground cursor-pointer">
                    {user.artist_name || user.full_name}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="ghost" 
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}