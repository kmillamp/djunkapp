import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FinancialGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FinancialGoalModal({ open, onOpenChange, onSuccess }: FinancialGoalModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState<Date>();

  const categories = [
    'equipamento',
    'viagem',
    'curso',
    'investimento',
    'emergencia',
    'outros'
  ];

  const handleSubmit = async () => {
    if (!user || !title || !targetAmount || !category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user.id,
          title,
          target_amount: parseFloat(targetAmount),
          current_amount: parseFloat(currentAmount),
          category,
          deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null
        });

      if (error) throw error;

      toast.success('Meta financeira criada com sucesso!');
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setCategory('');
      setDeadline(undefined);
    } catch (error) {
      console.error('Erro ao criar meta financeira:', error);
      toast.error('Erro ao criar meta financeira');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Target className="w-5 h-5 text-accent" />
            Nova Meta Financeira
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Título da Meta
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Novo Controlador MIDI"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Valor Objetivo (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Valor Atual (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
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
              Prazo (Opcional)
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
              {loading ? 'Criando...' : 'Criar Meta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
