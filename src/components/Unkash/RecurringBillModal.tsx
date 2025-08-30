import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RecurringBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RecurringBillModal({ open, onOpenChange, onSuccess }: RecurringBillModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDay, setDueDay] = useState('');

  const categories = [
    'streaming',
    'software',
    'equipamento',
    'seguro',
    'aluguel',
    'energia',
    'telefone',
    'outros'
  ];

  const handleSubmit = async () => {
    if (!user || !title || !amount || !category || !dueDay) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('recurring_bills')
        .insert({
          user_id: user.id,
          title,
          amount: parseFloat(amount),
          category,
          due_day: parseInt(dueDay),
          is_active: true
        });

      if (error) throw error;

      toast.success('Despesa fixa criada com sucesso!');
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setAmount('');
      setCategory('');
      setDueDay('');
    } catch (error) {
      console.error('Erro ao criar despesa fixa:', error);
      toast.error('Erro ao criar despesa fixa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="w-5 h-5 text-warning" />
            Nova Despesa Fixa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Título
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Spotify Premium"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Valor (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Categoria
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Dia do Vencimento
            </label>
            <Select value={dueDay} onValueChange={setDueDay}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    Dia {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Criando...' : 'Criar Despesa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
