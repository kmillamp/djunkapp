import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/unk-button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, ArrowLeft, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Prospeccao {
  id: string;
  nome: string;
  contato: string;
  email: string;
  telefone: string;
  evento: string;
  data: string;
  orcamento: string;
  status: 'prospecção' | 'negociação' | 'fechado' | 'perdido';
  observacao: string;
  created_at: string;
}

export default function ProspeccaoDatas() {
  const navigate = useNavigate();
  const [prospeccoes, setProspeccoes] = useState<Prospeccao[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    contato: '',
    email: '',
    telefone: '',
    evento: '',
    data: '',
    orcamento: '',
    status: 'prospecção' as Prospeccao['status'],
    observacao: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const statusColors = {
    prospecção: 'text-blue-400 border-blue-400',
    negociação: 'text-yellow-400 border-yellow-400',
    fechado: 'text-green-400 border-green-400',
    perdido: 'text-red-400 border-red-400'
  };

  const statusLabels = {
    prospecção: 'Prospecção',
    negociação: 'Negociação',
    fechado: 'Fechado',
    perdido: 'Perdido'
  };

  useEffect(() => {
    fetchProspeccoes();
  }, []);

  const fetchProspeccoes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('prospeccoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar prospecções:', error);
        toast.error('Erro ao carregar prospecções');
        return;
      }

      const formattedProspeccoes = (data || []).map(item => ({
        ...item,
        status: (item.status as Prospeccao['status']) || 'prospecção'
      }));

      setProspeccoes(formattedProspeccoes);
    } catch (error) {
      console.error('Erro ao buscar prospecções:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.contato) {
      toast.error('Nome e contato são obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      if (editingId) {
        // Atualizar
        const { error } = await supabase
          .from('prospeccoes')
          .update(form)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Prospecção atualizada com sucesso!');
      } else {
        // Criar nova
        const { error } = await supabase
          .from('prospeccoes')
          .insert([form]);

        if (error) throw error;
        toast.success('Prospecção criada com sucesso!');
      }

      setShowForm(false);
      setForm({
        nome: '',
        contato: '',
        email: '',
        telefone: '',
        evento: '',
        data: '',
        orcamento: '',
        status: 'prospecção',
        observacao: ''
      });
      setEditingId(null);
      await fetchProspeccoes();
    } catch (error: any) {
      console.error('Erro ao salvar prospecção:', error);
      toast.error('Erro ao salvar prospecção');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Prospeccao) => {
    setForm({
      nome: p.nome,
      contato: p.contato,
      email: p.email,
      telefone: p.telefone,
      evento: p.evento,
      data: p.data,
      orcamento: p.orcamento,
      status: p.status,
      observacao: p.observacao
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta prospecção?')) return;

    try {
      const { error } = await supabase
        .from('prospeccoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Prospecção deletada com sucesso!');
      await fetchProspeccoes();
    } catch (error) {
      console.error('Erro ao deletar prospecção:', error);
      toast.error('Erro ao deletar prospecção');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/central')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Search className="w-6 h-6 text-orange-400" />
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
            Prospecção de Datas
          </h1>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({
              nome: '',
              contato: '',
              email: '',
              telefone: '',
              evento: '',
              data: '',
              orcamento: '',
              status: 'prospecção',
              observacao: ''
            });
          }}
          variant="hero"
        >
          <Plus className="w-4 h-4 mr-1" /> Nova Prospecção
        </Button>
      </div>

      {showForm && (
        <GlassCard variant="primary" className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {editingId ? 'Editar Prospecção' : 'Nova Prospecção'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Nome do Cliente *</label>
              <input
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                placeholder="Nome do cliente"
                value={form.nome}
                onChange={e => setForm(f => ({...f, nome: e.target.value}))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Empresa/Função *</label>
              <input
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                placeholder="Empresa ou função"
                value={form.contato}
                onChange={e => setForm(f => ({...f, contato: e.target.value}))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <input
                type="email"
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Telefone</label>
              <input
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={e => setForm(f => ({...f, telefone: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Tipo de Evento</label>
              <input
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                placeholder="Casamento, Festa, Corporativo..."
                value={form.evento}
                onChange={e => setForm(f => ({...f, evento: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Data do Evento</label>
              <input
                type="date"
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                value={form.data}
                onChange={e => setForm(f => ({...f, data: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Orçamento</label>
              <input
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                placeholder="R$ 2.500"
                value={form.orcamento}
                onChange={e => setForm(f => ({...f, orcamento: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
              <select
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                value={form.status}
                onChange={e => setForm(f => ({...f, status: e.target.value as Prospeccao['status']}))}
              >
                <option value="prospecção">Prospecção</option>
                <option value="negociação">Negociação</option>
                <option value="fechado">Fechado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Observações</label>
              <textarea
                className="w-full rounded bg-background border border-input px-3 py-2 text-foreground"
                placeholder="Detalhes sobre a negociação..."
                rows={3}
                value={form.observacao}
                onChange={e => setForm(f => ({...f, observacao: e.target.value}))}
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                variant="hero"
              >
                {editingId ? 'Salvar Alterações' : 'Cadastrar Prospecção'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-muted-foreground text-sm col-span-full text-center">Carregando...</div>
        ) : prospeccoes.length === 0 ? (
          <div className="text-muted-foreground text-sm col-span-full text-center">Nenhuma prospecção cadastrada.</div>
        ) : (
          prospeccoes.map(p => (
            <GlassCard key={p.id} variant="primary" className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-foreground">{p.nome}</h4>
                    <Badge className={`text-xs ${statusColors[p.status]} bg-transparent`}>
                      {statusLabels[p.status]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{p.contato}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(p)}
                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {p.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{p.email}</span>
                  </div>
                )}
                {p.telefone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{p.telefone}</span>
                  </div>
                )}
                {p.evento && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Search className="w-4 h-4" />
                    <span>{p.evento}</span>
                  </div>
                )}
                {p.data && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(p.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {p.orcamento && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>{p.orcamento}</span>
                  </div>
                )}
                {p.observacao && (
                  <div className="mt-3 p-2 bg-background/50 rounded text-xs text-muted-foreground">
                    {p.observacao}
                  </div>
                )}
                <div className="mt-3 text-xs text-muted-foreground/70">
                  Criado em: {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}