import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostFormProps {
  onAdd: (post: any) => void;
}

export const PostForm = ({ onAdd }: PostFormProps) => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState({
    titulo: '',
    tipo: 'foto',
    conteudo: '',
    hashtags: '',
    status: 'rascunho',
    dataPublicacao: '',
    imagem_url: '',
    compartilhar_admin: false
  });

  const handleSubmit = async () => {
    if (!post.titulo.trim() || !user) return;
    
    setSaving(true);
    try {
      const projectData = {
        user_id: user.id,
        title: post.titulo,
        description: post.conteudo,
        type: 'instagram',
        status: post.status === 'rascunho' ? 'todo' : 'completed',
        priority: 'medium',
        deadline: post.dataPublicacao || null,
        content: `${post.conteudo}\n\n${post.hashtags}`,
        post_type: post.tipo,
        image_url: post.imagem_url || null,
        target_value: 0,
        current_progress: 0
      };

      const { error } = await supabase
        .from('projects')
        .insert(projectData);

      if (error) throw error;

      // Se for para compartilhar com admin, criar um registro na tabela projects com flag
      if (post.compartilhar_admin) {
        // Adicionar lógica para notificar admin se necessário
        toast.success('Post criado e compartilhado com admin!');
      } else {
        toast.success('Post criado como ' + (post.status === 'rascunho' ? 'rascunho' : 'pronto') + '!');
      }
      
      onAdd({
        id: Date.now().toString(),
        ...post,
        criadoEm: new Date().toISOString()
      });
      
      setPost({
        titulo: '',
        tipo: 'foto',
        conteudo: '',
        hashtags: '',
        status: 'rascunho',
        dataPublicacao: '',
        imagem_url: '',
        compartilhar_admin: false
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast.error('Erro ao salvar post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Ideia
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border/30">
        <DialogHeader>
          <DialogTitle className="text-primary">Criar Ideia de Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Título da Ideia *
            </label>
            <Input
              placeholder="Título do post..."
              value={post.titulo}
              onChange={(e) => setPost({...post, titulo: e.target.value})}
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Tipo de Post
            </label>
            <Select value={post.tipo} onValueChange={(value) => setPost({...post, tipo: value})}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foto">Foto</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="stories">Stories</SelectItem>
                <SelectItem value="reels">Reels</SelectItem>
                <SelectItem value="carrossel">Carrossel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Conteúdo/Legenda
            </label>
            <Textarea
              placeholder="Escreva a legenda ou descrição do post..."
              value={post.conteudo}
              onChange={(e) => setPost({...post, conteudo: e.target.value})}
              className="bg-background border-border"
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Imagem do Post
            </label>
            <ImageUpload
              bucket="avatars"
              value={post.imagem_url}
              onUpload={(url) => setPost({...post, imagem_url: url})}
              className="mb-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Hashtags
            </label>
            <Input
              placeholder="#musica #dj #house #techno"
              value={post.hashtags}
              onChange={(e) => setPost({...post, hashtags: e.target.value})}
              className="bg-background border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Status
              </label>
              <Select value={post.status} onValueChange={(value) => setPost({...post, status: value})}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Salvar como Rascunho</SelectItem>
                  <SelectItem value="pronto">Marcar como Pronto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Data de Publicação
              </label>
              <Input
                type="datetime-local"
                value={post.dataPublicacao}
                onChange={(e) => setPost({...post, dataPublicacao: e.target.value})}
                className="bg-background border-border"
              />
            </div>
          </div>
          
          {/* Opção para compartilhar com admin */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="compartilhar_admin"
              checked={post.compartilhar_admin}
              onChange={(e) => setPost({...post, compartilhar_admin: e.target.checked})}
              className="rounded border-gray-300"
            />
            <label htmlFor="compartilhar_admin" className="text-sm text-foreground">
              Compartilhar com administrador para aprovação
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit}
              className="flex-1"
              disabled={!post.titulo.trim() || saving}
            >
              {saving ? 'Salvando...' : 'Criar Post'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};