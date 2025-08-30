import React, { useState, useRef, useEffect } from 'react';
import { Heart, Moon, Sun, Activity, Book, Smile, Volume2, VolumeX, AlertCircle, Play, Pause, RotateCcw, Users, Badge, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Interfaces
interface Activity {
  id: string;
  name: string;
  completed: boolean;
}
interface GratitudeEntry {
  id: string;
  date: string;
  text: string;
}
interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  note: string;
  activities: string[];
}
interface Metrics {
  horasSono: number;
  hidratacao: number;
  alimentacao: number;
}
interface Habit {
  id: string;
  name: string;
  completed: boolean;
  icon: any;
  category: string;
  streak: number;
}
export default function SelfCare() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados gerais
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMood, setCurrentMood] = useState(7);
  const [moodNote, setMoodNote] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newGratitude, setNewGratitude] = useState('');
  const [newHabit, setNewHabit] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('sleep');
  const [loading, setLoading] = useState(true);

  // Métricas - começar com zeros
  const [metrics, setMetrics] = useState({
    horasSono: 0,
    hidratacao: 0,
    alimentacao: 0
  });

  // Estados para o equalizador
  const [bars, setBars] = useState(() => Array.from({
    length: 6
  }, (_, i) => ({
    id: i,
    height: Math.random() * 60 + 20,
    delay: i * 0.1
  })));

  // Atualizar equalizador
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(bar => ({
        ...bar,
        height: Math.min(80, Math.max(15, bar.height + (Math.random() * 40 - 20)))
      })));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Estados para o check auditivo
  const [isPlayingTone, setIsPlayingTone] = useState(false);
  const [hearingCheckLevel, setHearingCheckLevel] = useState(50);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Estados para o timer de respiração
  const [breathTimer, setBreathTimer] = useState(300);
  const [breathRunning, setBreathRunning] = useState(false);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Estados das atividades, gratidão e humor
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (user) {
      loadSelfCareData();
    }
  }, [user, selectedDate]);

  const loadSelfCareData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadActivities(),
        loadGratitudeEntries(),
        loadMoodEntries(), 
        loadHabits(),
        loadMetrics()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do autocuidado');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('self_care_activities')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', selectedDate);

      if (error) throw error;
      setActivities(data?.map(a => ({
        id: a.id,
        name: a.name,
        completed: a.completed
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const loadGratitudeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('gratitude_entries')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGratitudeEntries(data?.map(g => ({
        id: g.id,
        date: g.date,
        text: g.text
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar gratidão:', error);
    }
  };

  const loadMoodEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMoodEntries(data?.map(m => ({
        id: m.id,
        date: m.date,
        mood: m.mood,
        note: m.note || '',
        activities: m.activities || []
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar humor:', error);
    }
  };

  const loadHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('self_care_habits')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', selectedDate);

      if (error) throw error;
      
      const iconMap = {
        sleep: Moon,
        fitness: Activity,
        learning: Book,
        other: Heart
      };
      
      setHabits(data?.map(h => ({
        id: h.id,
        name: h.name,
        completed: h.completed,
        icon: iconMap[h.category as keyof typeof iconMap] || Heart,
        category: h.category,
        streak: h.streak || 0
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar hábitos:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('self_care_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', selectedDate)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setMetrics({
          horasSono: parseFloat(String(data.sleep_hours || '0')),
          hidratacao: parseFloat(String(data.water_intake || '0')),
          alimentacao: data.nutrition_score || 0
        });
      } else {
        // Se não há dados, mostrar zeros
        setMetrics({
          horasSono: 0,
          hidratacao: 0,
          alimentacao: 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      // Em caso de erro, mostrar zeros
      setMetrics({
        horasSono: 0,
        hidratacao: 0,
        alimentacao: 0
      });
    }
  };

  // Funções para hábitos
  const toggleHabit = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const { error } = await supabase
        .from('self_care_habits')
        .update({ 
          completed: !habit.completed,
          streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1)
        })
        .eq('id', habitId);

      if (error) throw error;
      await loadHabits();
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      toast.error('Erro ao atualizar hábito');
    }
  };
  const addHabit = async () => {
    if (newHabit.trim() && user) {
      try {
        const { error } = await supabase
          .from('self_care_habits')
          .insert({
            user_id: user.id,
            name: newHabit,
            category: newHabitCategory,
            date: selectedDate,
            completed: false,
            streak: 0
          });

        if (error) throw error;
        setNewHabit('');
        await loadHabits();
        toast.success('Hábito adicionado!');
      } catch (error) {
        console.error('Erro ao adicionar hábito:', error);
        toast.error('Erro ao adicionar hábito');
      }
    }
  };
  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('self_care_habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;
      await loadHabits();
      toast.success('Hábito removido!');
    } catch (error) {
      console.error('Erro ao remover hábito:', error);
      toast.error('Erro ao remover hábito');
    }
  };
  
  const deleteGratitude = async (gratitudeId: string) => {
    try {
      const { error } = await supabase
        .from('gratitude_entries')
        .delete()
        .eq('id', gratitudeId);

      if (error) throw error;
      await loadGratitudeEntries();
      toast.success('Entrada de gratidão removida!');
    } catch (error) {
      console.error('Erro ao remover gratidão:', error);
      toast.error('Erro ao remover gratidão');
    }
  };
  
  const clearMoodHistory = async () => {
    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
      setMoodEntries([]);
      toast.success('Histórico de humor limpo!');
    } catch (error) {
      console.error('Erro ao limpar humor:', error);
      toast.error('Erro ao limpar humor');
    }
  };
  
  const deleteMoodEntry = async (moodId: string) => {
    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', moodId);

      if (error) throw error;
      await loadMoodEntries();
      toast.success('Entrada de humor removida!');
    } catch (error) {
      console.error('Erro ao remover entrada:', error);
      toast.error('Erro ao remover entrada');
    }
  };
  const updateMetric = async (key: keyof Metrics, value: number) => {
    try {
      const updatedMetrics = { ...metrics, [key]: value };
      setMetrics(updatedMetrics);

      const { error } = await supabase
        .from('self_care_metrics')
        .upsert({
          user_id: user?.id,
          date: selectedDate,
          sleep_hours: key === 'horasSono' ? value : metrics.horasSono,
          water_intake: key === 'hidratacao' ? value : metrics.hidratacao,
          nutrition_score: key === 'alimentacao' ? value : metrics.alimentacao
        }, { onConflict: 'user_id,date' });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar métrica:', error);
      toast.error('Erro ao atualizar métrica');
    }
  };
  function getCategoryName(category: string) {
    switch (category) {
      case 'sleep':
        return 'Sono';
      case 'fitness':
        return 'Exercício';
      case 'learning':
        return 'Aprendizado';
      case 'other':
        return 'Outro';
      default:
        return 'Outro';
    }
  }
  function getCategoryColor(category: string) {
    switch (category) {
      case 'sleep':
        return 'border-blue-400 text-blue-400';
      case 'fitness':
        return 'border-green-400 text-green-400';
      case 'learning':
        return 'border-yellow-400 text-yellow-400';
      case 'other':
        return 'border-pink-400 text-pink-400';
      default:
        return 'border-gray-400 text-gray-400';
    }
  }

  // Funções para o check auditivo
  const playAudioTest = () => {
    if (isPlayingTone) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 1000;
    const linear = hearingCheckLevel / 100;
    gain.gain.value = Math.pow(linear, 2) * 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    audioCtxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;
    setIsPlayingTone(true);
  };
  const stopAudioTest = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {}
      oscRef.current = null;
    }
    if (gainRef.current) {
      try {
        gainRef.current.disconnect();
      } catch {}
      gainRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setIsPlayingTone(false);
  };

  // Funções para o timer de respiração
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const startBreathTimer = () => {
    if (!breathRunning) {
      setBreathRunning(true);
      breathIntervalRef.current = setInterval(() => {
        setBreathTimer(prev => {
          if (prev <= 0) {
            pauseBreathTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  const pauseBreathTimer = () => {
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current);
      breathIntervalRef.current = null;
    }
    setBreathRunning(false);
  };
  const resetBreathTimer = () => {
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current);
      breathIntervalRef.current = null;
    }
    setBreathTimer(300);
    setBreathRunning(false);
  };

  // Efeitos
  useEffect(() => {
    if (gainRef.current) {
      const linear = hearingCheckLevel / 100;
      gainRef.current.gain.value = Math.pow(linear, 2) * 0.3;
    }
  }, [hearingCheckLevel]);
  useEffect(() => {
    return () => {
      stopAudioTest();
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    };
  }, []);

  // Constantes para humor
  const moodEmojis = ['😢', '😟', '😐', '🙂', '😊', '😄', '🤩', '✨', '🔥', '🚀'];
  const moodLabels = ['Muito mal', 'Mal', 'Ruim', 'Ok', 'Bem', 'Muito bem', 'Ótimo', 'Incrível', 'Fantástico', 'Épico'];
  const saveMoodEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      mood: currentMood,
      note: moodNote,
      activities: []
    };
    const existingEntryIndex = moodEntries.findIndex(entry => entry.date === selectedDate);
    if (existingEntryIndex >= 0) {
      const updated = [...moodEntries];
      updated[existingEntryIndex] = newEntry;
      setMoodEntries(updated);
    } else {
      setMoodEntries([newEntry, ...moodEntries]);
    }
    setMoodNote('');
  };
  const getMetricPercentage = (value: number, max: number) => Math.min(value / max * 100, 100);
  return <div className="min-h-screen bg-background text-foreground pb-20 px-4">
      {/* Header */}
      <div className="p-4 sm:p-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            AutoCuidado DJ
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Sua saúde mental e bem-estar são tão importantes quanto suas mixagens.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Tabs defaultValue="habits" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="habits" className="text-xs">
              Hábitos
            </TabsTrigger>
            <TabsTrigger value="mood" className="text-xs">
              Auto-Cuidado
            </TabsTrigger>
            <TabsTrigger value="safe" className="text-xs">
              Safe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits" className="space-y-4">
            {/* Header Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                O que eu posso fazer por mim?
              </h2>
              <p className="text-muted-foreground text-sm">
                Pequenos cuidados diários fazem toda a diferença no seu bem-estar
              </p>
            </div>

            {/* Activities Section */}
            <GlassCard className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="text-pink-400 font-medium">Atividades do Dia</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                  if (newActivity.trim()) {
                    setActivities([...activities, {
                      id: Date.now().toString(),
                      name: newActivity,
                      completed: false
                    }]);
                    setNewActivity('');
                  }
                }} className="text-pink-400 hover:text-pink-300">
                    + Nova
                  </Button>
                </div>

                {/* Add New Activity Input */}
                <div className="mb-4">
                  <Input value={newActivity} onChange={e => setNewActivity(e.target.value)} placeholder="Digite uma nova atividade..." className="bg-muted border-border" onKeyPress={e => {
                  if (e.key === 'Enter' && newActivity.trim()) {
                    setActivities([...activities, {
                      id: Date.now().toString(),
                      name: newActivity,
                      completed: false
                    }]);
                    setNewActivity('');
                  }
                }} />
                </div>

                <div className="space-y-3">
                  {activities.map(activity => <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border group">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={activity.completed} onChange={() => {
                      setActivities(activities.map(a => a.id === activity.id ? {
                        ...a,
                        completed: !a.completed
                      } : a));
                    }} className="w-5 h-5 rounded border-border" />
                        <span className={activity.completed ? 'line-through text-muted-foreground text-base' : 'text-foreground text-base'}>
                          {activity.name}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                    setActivities(activities.filter(a => a.id !== activity.id));
                  }} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80">
                        Remover
                      </Button>
                    </div>)}
                </div>
              </div>
            </GlassCard>

            {/* Habits List */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-pink-400 text-base font-semibold">Seus Hábitos</h3>
                <Button variant="ghost" size="sm" onClick={addHabit} className="text-pink-400 hover:text-pink-300">
                  + Novo Hábito
                </Button>
              </div>

              {/* Add New Habit */}
              <div className="space-y-3 mb-4">
                <Input value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="Nome do novo hábito..." className="bg-muted border-border" onKeyPress={e => {
                if (e.key === 'Enter') {
                  addHabit();
                }
              }} />
                <select value={newHabitCategory} onChange={e => setNewHabitCategory(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-sm">
                  <option value="sleep">Sono</option>
                  <option value="fitness">Exercício</option>
                  <option value="learning">Aprendizado</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="space-y-3">
                {habits.map(habit => {
                const Icon = habit.icon;
                return <div key={habit.id} className={`p-3 rounded-lg border transition-all group ${habit.completed ? 'bg-muted border-border/50' : 'bg-muted/50 border-border hover:bg-muted'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button variant={habit.completed ? "default" : "ghost"} size="sm" onClick={() => toggleHabit(habit.id)} className="p-2">
                            <Icon className="w-4 h-4" />
                          </Button>
                          <div>
                            <p className={`font-medium text-sm ${habit.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {habit.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(habit.category)}`}>
                                {getCategoryName(habit.category)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80">
                          Remover
                        </Button>
                      </div>
                    </div>;
              })}
              </div>
            </GlassCard>

            {/* Gratitude Jar Section */}
            <GlassCard className="p-4">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Pote da Gratidão
              </h3>
              
              {/* Add New Gratitude */}
              <div className="mb-4">
                <Textarea value={newGratitude} onChange={e => setNewGratitude(e.target.value)} placeholder="Por que você é grato(a) hoje?" className="bg-muted border-border min-h-[100px]" />
                <Button variant="default" size="sm" onClick={() => {
                if (newGratitude.trim()) {
                  setGratitudeEntries([{
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    text: newGratitude
                  }, ...gratitudeEntries]);
                  setNewGratitude('');
                }
              }} className="mt-2 w-full">
                  Adicionar ao Pote
                </Button>
              </div>

              {/* Gratitude Entries */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {gratitudeEntries.map(entry => <div key={entry.id} className="p-3 bg-muted rounded-lg border border-border group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-foreground text-sm flex-1">{entry.text}</p>
                      <Button variant="ghost" size="sm" onClick={() => deleteGratitude(entry.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 p-1">
                        ×
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>)}
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="mood" className="space-y-4">
            {/* Header Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Conecte-se consigo mesmo antes de conectar-se com o público.
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto" />
            </div>

            {/* Equalizador de métricas */}
            <GlassCard className="p-4">
              <div className="text-center space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center justify-center gap-2">
                  <Activity size={20} className="text-purple-400" />
                  Suas Métricas de Bem-estar
                </h2>

                {/* Equalizer central */}
                <div className="flex items-end justify-center space-x-1.5 h-12 mx-auto">
                  {bars.map((bar, i) => {
                  const grads = ["from-pink-500 to-purple-500", "from-blue-500 to-cyan-400", "from-green-400 to-lime-400", "from-yellow-400 to-orange-500", "from-purple-500 to-pink-400", "from-cyan-400 to-blue-500"];
                  const grad = grads[i % grads.length];
                  return <div key={bar.id} className={`bg-gradient-to-t ${grad} w-2 rounded-t-sm transition-all duration-300`} style={{
                    height: `${bar.height}%`,
                    animationDelay: `${bar.delay}s`
                  }} />;
                })}
                </div>
              </div>

              {/* Equalizador de métricas (barras grandes) */}
              <div className="bg-muted rounded-xl p-4 border border-border mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-purple-400" />
                  Suas Métricas de Bem-estar
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Card Sono */}
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-foreground">Sono</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{metrics.horasSono}h</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full mb-3">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000" style={{
                      width: `${getMetricPercentage(metrics.horasSono, 8)}%`
                    }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={metrics.horasSono} onChange={e => updateMetric('horasSono', Number(e.target.value))} min="0" max="12" step="0.5" className="h-8 text-xs" placeholder="Horas" />
                      <span className="text-xs text-muted-foreground">horas</span>
                    </div>
                  </div>

                  {/* Card Hidratação */}
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-medium text-foreground">Hidratação</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{metrics.hidratacao}L</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full mb-3">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-1000" style={{
                      width: `${getMetricPercentage(metrics.hidratacao, 3)}%`
                    }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={metrics.hidratacao} onChange={e => updateMetric('hidratacao', Number(e.target.value))} min="0" max="5" step="0.1" className="h-8 text-xs" placeholder="Litros" />
                      <span className="text-xs text-muted-foreground">litros</span>
                    </div>
                  </div>

                  {/* Card Alimentação */}
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium text-foreground">Alimentação</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{metrics.alimentacao}/5</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full mb-3">
                      <div className="h-full bg-gradient-to-r from-green-500 to-lime-400 rounded-full transition-all duration-1000" style={{
                      width: `${getMetricPercentage(metrics.alimentacao, 5)}%`
                    }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={metrics.alimentacao} onChange={e => updateMetric('alimentacao', Number(e.target.value))} min="0" max="5" step="1" className="h-8 text-xs" placeholder="Refeições" />
                      <span className="text-xs text-muted-foreground">refeições</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Check Auditivo */}
            <GlassCard className="space-y-4 p-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-foreground">Check Auditivo</h3>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  {isPlayingTone ? <Volume2 className="w-8 h-8 text-yellow-400 animate-pulse" /> : <VolumeX className="w-8 h-8 text-muted-foreground" />}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">
                      Nível (volume): {hearingCheckLevel}%
                    </label>
                    <input type="range" min="0" max="100" value={hearingCheckLevel} onChange={e => setHearingCheckLevel(Number(e.target.value))} className="w-full" />
                  </div>

                  <Button onClick={() => isPlayingTone ? stopAudioTest() : playAudioTest()} variant="outline" className="w-full text-yellow-400 border-yellow-400 hover:bg-yellow-400/10">
                    {isPlayingTone ? "Parar Tom" : "Reproduzir Tom"}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-500/10 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Use fones para um teste mais preciso. Se notar mudanças na audição, procure um profissional.
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Pausa para Respirar */}
            <GlassCard className="space-y-4 p-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Heart size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Pausa para Respirar</h3>
                  <p className="text-sm text-muted-foreground">Respire fundo e relaxe por um momento</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center ${breathRunning ? "border-green-400 bg-green-400/10 animate-pulse" : "border-border bg-muted"}`}>
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-foreground">{formatTime(breathTimer)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{breathRunning ? "Respirando..." : "Pronto"}</div>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button onClick={breathRunning ? pauseBreathTimer : startBreathTimer} variant="outline" className="flex items-center gap-2 text-green-400 border-green-400 hover:bg-green-400/10">
                    {breathRunning ? <Pause size={16} /> : <Play size={16} />}
                    {breathRunning ? "Pausar" : "Iniciar"}
                  </Button>

                  <Button onClick={resetBreathTimer} variant="outline" className="flex items-center gap-2">
                    <RotateCcw size={16} />
                    Reset
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Inspire 4s — segure 4s — expire 4s. Repita até se sentir melhor.
                </p>
              </div>
            </GlassCard>

            {/* Mood Tracking */}
            <GlassCard className="p-4">
              <h3 className="text-amber-400 text-base font-semibold mb-4">Registrar Humor</h3>
              
              <div className="space-y-4">
                {/* Date Selector */}
                <div>
                  <label className="text-muted-foreground text-sm block mb-2">Data</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-sm" />
                </div>

                {/* Mood Scale */}
                <div>
                  <label className="text-muted-foreground text-sm block mb-3">
                    Humor: {moodLabels[currentMood - 1]} {moodEmojis[currentMood - 1]}
                  </label>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {Array.from({
                    length: 10
                  }, (_, i) => i + 1).map(mood => <Button key={mood} variant={currentMood === mood ? "default" : "ghost"} size="sm" onClick={() => setCurrentMood(mood)} className="p-2 text-lg rounded-sm bg-inherit">
                        {moodEmojis[mood - 1]}
                      </Button>)}
                  </div>
                </div>

                {/* Mood Note */}
                <div>
                  <label className="text-muted-foreground text-sm block mb-2">Como foi seu dia?</label>
                  <Textarea value={moodNote} onChange={e => setMoodNote(e.target.value)} placeholder="Escreva sobre seu dia, sentimentos, conquistas..." className="bg-muted border-border resize-none" rows={3} />
                </div>

                <Button onClick={saveMoodEntry} variant="default" size="sm" className="w-full bg-pink-700 hover:bg-pink-600">
                  Salvar Registro
                </Button>
              </div>
            </GlassCard>

            {/* Recent Mood Entries */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-400 text-base font-semibold">Histórico</h3>
                {moodEntries.length > 0 && <Button variant="ghost" size="sm" onClick={clearMoodHistory} className="text-destructive hover:text-destructive/80 text-xs">
                    Limpar Histórico
                  </Button>}
              </div>
              <div className="space-y-3">
                {moodEntries.length === 0 ? <div className="text-center py-6">
                    <Smile className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Nenhum registro ainda</p>
                  </div> : moodEntries.slice(0, 5).map(entry => <div key={entry.id} className="bg-muted rounded-lg border border-border p-3 group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-foreground font-medium text-sm">
                          {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => deleteMoodEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 p-1 h-auto">
                            ×
                          </Button>
                          <span className="text-xl">{moodEmojis[entry.mood - 1]}</span>
                          <span className="text-amber-400 border border-amber-400 text-xs px-2 py-1 rounded">
                            {entry.mood}/10
                          </span>
                        </div>
                      </div>
                      {entry.note && <p className="text-muted-foreground text-xs">{entry.note}</p>}
                    </div>)}
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="safe" className="space-y-4">
            {/* Header Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Sua saúde mental é sua maior ferramenta
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto" />
            </div>

            {/* Dicas Essenciais */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Dicas Essenciais</h3>
                {/* Equalizer */}
                <div className="flex items-end justify-center space-x-1.5 h-12">
                  {bars.map((bar, i) => {
                  const grads = ["from-pink-500 to-purple-500", "from-blue-500 to-cyan-400", "from-green-400 to-lime-400", "from-yellow-400 to-orange-500", "from-purple-500 to-pink-400", "from-cyan-400 to-blue-500"];
                  const grad = grads[i % grads.length];
                  return <div key={i} className={`w-1.5 bg-gradient-to-t ${grad} rounded-full animate-pulse`} style={{
                    height: `${bar}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s'
                  }} />;
                })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-pink-400/30">
                  <Heart className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Está difícil? — tudo bem pedir ajuda.</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-blue-400/30">
                  <Moon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Tente um horário fixo de sono: sua mente agradece.</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-green-400/30">
                  <Users className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Converse com outros DJs — comunidade é antídoto de burnout.</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-purple-400/30">
                  <Heart className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Separe um hobby fora da música para recarregar.</span>
                </div>
              </div>
            </GlassCard>

            {/* Centro de Recursos */}
            <GlassCard className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Badge className="w-5 h-5 text-amber-400" />
                Centro de Recursos
              </h3>
              
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <h4 className="text-red-400 font-medium mb-2 text-sm">Emergência</h4>
                  <p className="text-muted-foreground text-xs mb-2">Centro de Valorização da Vida - CVV</p>
                  <p className="text-foreground font-mono text-sm">📞 188</p>
                  <p className="text-muted-foreground text-xs mt-1">Disponível 24h, gratuito</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="text-blue-400 font-medium mb-2 text-sm">Suporte Psicológico</h4>
                  <p className="text-muted-foreground text-xs mb-1">• Terapia online ou presencial</p>
                  
                  <p className="text-muted-foreground text-xs">• UBS com psicólogos (SUS)</p>
                </div>

                
              </div>
            </GlassCard>

            {/* Sinais de Alerta */}
            <GlassCard className="p-4">
              <h3 className="text-yellow-400 text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Sinais de Alerta
              </h3>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm font-medium mb-2">⚠️ Procure ajuda se você sente:</p>
                <ul className="space-y-1 text-muted-foreground text-xs">
                  <li>• Ansiedade constante antes dos shows</li>
                  <li>• Perda de prazer na música</li>
                  <li>• Isolamento social excessivo</li>
                  <li>• Mudanças drásticas no sono ou apetite</li>
                  <li>• Uso de substâncias para "aguentar"</li>
                  <li>• Pensamentos de autolesão</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground text-xs mb-3">Lembre-se: A UNK é sua família, pedir ajuda é um ato de coragem e autocuidado.</p>
                <Button variant="outline" className="text-green-400 border-green-400 hover:bg-green-400/10">
                  Você não está sozinho(a)
                </Button>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}