import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Eye, Calendar, User } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/unk-button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  content: string | null;
  post_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    artist_name: string | null;
  } | null;
}

const PostsApproval: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadPendingPosts();
  }, [isAdmin, navigate]);

  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar posts pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (postId: string, approved: boolean) => {
    setProcessingId(postId);
    try {
      const { error } = await supabase
        .from('instagram_posts')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      toast.success(approved ? 'Post aprovado!' : 'Post rejeitado!');
      loadPendingPosts();
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      toast.error('Erro ao processar aprovação');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/admin/central')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Aprovação de Posts
        </h1>
        <div></div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-4xl mx-auto space-y-4">
        {posts.length === 0 ? (
          <GlassCard variant="primary" className="p-8 text-center">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum post pendente
            </h3>
            <p className="text-muted-foreground">
              Todos os posts foram processados ou não há novas submissões.
            </p>
          </GlassCard>
        ) : (
          posts.map((post) => (
            <GlassCard key={post.id} variant="primary" className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Post Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Usuário ID: {post.user_id}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.created_at)}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(post.status)}>
                      Pendente
                    </Badge>
                  </div>

                  {post.content && (
                    <div className="p-4 bg-background/50 rounded-lg border border-border/30">
                      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                    </div>
                  )}

                  {post.post_date && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Data programada:</strong> {new Date(post.post_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-3 lg:w-32">
                  <Button
                    variant="glass"
                    className="flex-1 lg:flex-none bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                    onClick={() => handleApproval(post.id, true)}
                    disabled={processingId === post.id}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="glass"
                    className="flex-1 lg:flex-none bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                    onClick={() => handleApproval(post.id, false)}
                    disabled={processingId === post.id}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default PostsApproval;