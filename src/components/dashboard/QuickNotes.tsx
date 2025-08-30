import { useState, useEffect } from "react"
import { Plus, StickyNote, Trash2 } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/unk-button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface Note {
  id: string;
  content: string;
  created_at: string;
}

export const QuickNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;

      try {
        // Para agora, vamos usar dados locais
        // Posteriormente isso virá do Supabase
        const mockNotes = [
          { id: '1', content: 'Preparar setlist para show de sexta', created_at: new Date().toISOString() },
          { id: '2', content: 'Estudar novo drop do Vintage Culture', created_at: new Date().toISOString() }
        ];
        setNotes(mockNotes);
      } catch (error) {
        console.error('Erro ao buscar notas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  const addNote = async () => {
    if (!newNote.trim() || !user || adding) return;

    setAdding(true);
    try {
      const newNoteObj = {
        id: Date.now().toString(),
        content: newNote.trim(),
        created_at: new Date().toISOString()
      };

      setNotes([newNoteObj, ...notes.slice(0, 4)]);
      setNewNote("");
      setShowInput(false);
      toast.success('Nota adicionada!');
    } catch (error) {
      toast.error('Erro ao adicionar nota');
    } finally {
      setAdding(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Nota excluída!');
    } catch (error) {
      toast.error('Erro ao excluir nota');
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-foreground">Notas Fixas</h3>
          </div>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-muted/20 rounded-lg"></div>
          <div className="h-8 bg-muted/20 rounded-lg"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-warning" />
          <h3 className="font-semibold text-foreground">Notas Fixas</h3>
        </div>
        <Button 
          variant="glass" 
          size="sm" 
          onClick={() => setShowInput(!showInput)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma nota <br />
          <span className="text-xs">Adicione lembretes importantes</span>
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className="text-sm text-foreground bg-muted/20 rounded-lg p-2 group flex items-start justify-between"
            >
              <span className="flex-1">{note.content}</span>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0"
                onClick={() => deleteNote(note.id)}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Nova nota..."
            className="flex-1 text-xs bg-background/50 border border-border rounded px-2 py-1 text-foreground"
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
            autoFocus
            disabled={adding}
          />
          <Button
            variant="glass"
            size="sm"
            onClick={addNote}
            disabled={adding}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </GlassCard>
  )
}