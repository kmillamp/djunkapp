import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Search, Filter, Calendar, MapPin, User } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/unk-button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface EventReport {
  id: string;
  dj_name: string;
  artist_name: string;
  event_name: string;
  event_date: string;
  location: string;
  producer_name: string;
  cache: number;
  status: string;
  created_at: string;
  user_id: string;
  user?: {
    full_name: string;
    artist_name: string;
  };
}

const Relatorios: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState<EventReport[]>([]);

  // Filtros
  const [filters, setFilters] = useState({
    djName: '',
    location: '',
    producerName: '',
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });

  // Carregar eventos
  useEffect(() => {
    loadEvents();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) {
        console.error('Erro ao carregar eventos:', error);
        return;
      }

      // Buscar informações dos usuários separadamente
      const userIds = [...new Set((data || []).map(event => event.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, artist_name')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formattedEvents: EventReport[] = (data || []).map(event => {
        const profile = profilesMap.get(event.user_id);
        return {
          id: event.id,
          dj_name: profile?.full_name || 'N/A',
          artist_name: profile?.artist_name || '',
          event_name: event.event_name,
          event_date: event.event_date,
          location: event.location || '',
          producer_name: event.producer_name || '',
          cache: event.cache || 0,
          status: event.status || 'pending',
          created_at: event.created_at || '',
          user_id: event.user_id,
          user: profile
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = events;

    if (filters.djName) {
      filtered = filtered.filter(event => 
        event.dj_name.toLowerCase().includes(filters.djName.toLowerCase()) ||
        event.artist_name.toLowerCase().includes(filters.djName.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.producerName) {
      filtered = filtered.filter(event =>
        event.producer_name.toLowerCase().includes(filters.producerName.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(event =>
        new Date(event.event_date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(event =>
        new Date(event.event_date) <= new Date(filters.dateTo)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setFilters({
      djName: '',
      location: '',
      producerName: '',
      dateFrom: '',
      dateTo: '',
      status: 'all'
    });
  };

  const getTotalCache = () => {
    return filteredEvents.reduce((total, event) => total + event.cache, 0);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pendente', color: 'text-yellow-400' },
      confirmed: { label: 'Confirmado', color: 'text-green-400' },
      cancelled: { label: 'Cancelado', color: 'text-red-400' },
      completed: { label: 'Realizado', color: 'text-blue-400' }
    };

    return statusMap[status] || { label: status, color: 'text-muted-foreground' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/admin/central')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Relatórios
        </h1>
        <div></div>
      </div>

      {/* Filtros */}
      <GlassCard variant="primary" className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">DJ</label>
            <Input
              type="text"
              value={filters.djName}
              onChange={(e) => setFilters(prev => ({ ...prev, djName: e.target.value }))}
              placeholder="Nome do DJ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Local</label>
            <Input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Localização"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Produtor</label>
            <Input
              type="text"
              value={filters.producerName}
              onChange={(e) => setFilters(prev => ({ ...prev, producerName: e.target.value }))}
              placeholder="Nome do produtor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Data de</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Data até</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 bg-background border border-input rounded-md text-foreground"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Realizado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={clearFilters}
            variant="outline"
          >
            Limpar Filtros
          </Button>
        </div>
      </GlassCard>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GlassCard variant="primary" className="text-center">
          <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{filteredEvents.length}</div>
          <div className="text-xs text-muted-foreground">Eventos Total</div>
        </GlassCard>

        <GlassCard variant="primary" className="text-center">
          <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {filteredEvents.filter(e => e.status === 'confirmed').length}
          </div>
          <div className="text-xs text-muted-foreground">Confirmados</div>
        </GlassCard>

        <GlassCard variant="primary" className="text-center">
          <User className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {new Set(filteredEvents.map(e => e.dj_name)).size}
          </div>
          <div className="text-xs text-muted-foreground">DJs Únicos</div>
        </GlassCard>

        <GlassCard variant="primary" className="text-center">
          <MapPin className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground">{formatCurrency(getTotalCache())}</div>
          <div className="text-xs text-muted-foreground">Cachê Total</div>
        </GlassCard>
      </div>

      {/* Tabela de eventos */}
      <GlassCard variant="primary">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-foreground">
            Eventos ({filteredEvents.length})
          </h3>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum evento encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground">DJ</th>
                  <th className="text-left p-3 text-muted-foreground">Evento</th>
                  <th className="text-left p-3 text-muted-foreground">Data</th>
                  <th className="text-left p-3 text-muted-foreground">Local</th>
                  <th className="text-left p-3 text-muted-foreground">Produtor</th>
                  <th className="text-left p-3 text-muted-foreground">Cachê</th>
                  <th className="text-left p-3 text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-border/50 hover:bg-background/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-foreground">{event.dj_name}</div>
                        {event.artist_name && (
                          <div className="text-xs text-muted-foreground">{event.artist_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{event.event_name}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(event.event_date)}</td>
                    <td className="p-3 text-muted-foreground">{event.location}</td>
                    <td className="p-3 text-muted-foreground">{event.producer_name}</td>
                    <td className="p-3 text-muted-foreground">{formatCurrency(event.cache)}</td>
                    <td className="p-3">
                      <span className={`${getStatusLabel(event.status).color} font-medium`}>
                        {getStatusLabel(event.status).label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Relatorios;