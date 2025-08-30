import { useState, useEffect } from "react"
import { Quote } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { supabase } from "@/lib/supabase"

interface QuoteData {
  id: string;
  quote: string;
  author: string;
  category: string;
}

export const DailyQuote = () => {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomQuote = async () => {
      try {
        // Para agora, vamos usar uma frase padrão
        // Posteriormente isso pode vir do Supabase
        setQuote({
          id: '1',
          quote: 'A sua sensibilidade é tua potência. O mundo precisa de gente que sente. Não se esconda.',
          author: 'Conexão UNK',
          category: 'motivacional'
        });
      } catch (error) {
        console.error('Erro ao buscar frase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomQuote();
  }, []);

  if (loading) {
    return (
      <GlassCard variant="secondary" className="p-4">
        <div className="flex items-start gap-3">
          <Quote className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="animate-pulse">
              <div className="h-4 bg-muted/40 rounded mb-2"></div>
              <div className="h-4 bg-muted/40 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!quote) {
    return (
      <GlassCard variant="secondary" className="p-4">
        <div className="flex items-start gap-3">
          <Quote className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
          <div>
            <blockquote className="text-sm text-foreground font-medium italic">
              "A sua sensibilidade é tua potência. O mundo precisa de gente que sente. Não se esconda."
            </blockquote>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="secondary" className="p-4">
      <div className="flex items-start gap-3">
        <Quote className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
        <div>
          <blockquote className="text-sm text-foreground font-medium italic">
            "{quote.quote}"
          </blockquote>
          {quote.author && quote.author.trim() && (
            <cite className="text-xs text-muted-foreground mt-2 block">
              — {quote.author}
            </cite>
          )}
        </div>
      </div>
    </GlassCard>
  )
}