import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Interface para definir a estrutura de um evento
interface Event {
  id: string;
  title: string; // Nome do evento
  event_date: string; // Data do evento
}

export const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      try {
        // Para agora, vamos usar dados mock
        // Posteriormente isso virá do Supabase
        const mockEvents = [
          { id: '1', title: 'Set no Warung Beach Club', event_date: '2024-12-25' },
          { id: '2', title: 'B2B com DJ Alok', event_date: '2024-12-31' },
          { id: '3', title: 'Festival Tomorrowland Brasil', event_date: '2025-01-15' }
        ];

        setEvents(mockEvents);
      } catch (error) {
        console.error('Erro geral ao buscar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Formata a data para um formato mais legível (ex: 25 de Julho)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Adicionado para consistência entre fusos horários
    });
  };

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-info" />
          <h3 className="font-semibold text-foreground">Próximos Eventos</h3>
        </div>
        {/* Skeleton Loader */}
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted/20 rounded-lg"></div>
          <div className="h-10 bg-muted/20 rounded-lg"></div>
          <div className="h-10 bg-muted/20 rounded-lg"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-info" />
        <h3 className="font-semibold text-foreground">Próximos Eventos</h3>
      </div>

      <div className="space-y-2">
        {events.length > 0 ? (
          events.map((event) => (
            <div 
              key={event.id} 
              className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-foreground font-medium text-sm">{event.title}</p>
              </div>
              <div className="text-info text-xs font-semibold">
                {formatDate(event.event_date)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum evento futuro na sua agenda.
          </p>
        )}
      </div>
    </GlassCard>
  );
};