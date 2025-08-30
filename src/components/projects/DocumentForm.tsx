import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/unk-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DocumentFormProps {
  onDocumentAdded: () => void;
}

export const DocumentForm = ({ onDocumentAdded }: DocumentFormProps) => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shared_with_admin: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos PNG, JPEG ou PDF são permitidos');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo deve ter no máximo 10MB');
        return;
      }
      
      setDocumentFile(file);
      if (!formData.name) {
        setFormData({ ...formData, name: file.name.split('.')[0] });
      }
    }
  };

  const uploadDocument = async (): Promise<string | null> => {
    if (!documentFile || !user) return null;
    
    setUploading(true);
    try {
      const fileExt = documentFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, documentFile);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do documento');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !documentFile) return;
    
    setLoading(true);
    try {
      const fileUrl = await uploadDocument();
      if (!fileUrl) {
        setLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: user?.id,
          name: formData.name,
          description: formData.description || null,
          file_url: fileUrl,
          file_type: documentFile.type,
          file_size: documentFile.size,
          mime_type: documentFile.type,
          shared_with_admin: formData.shared_with_admin
        });

      if (error) throw error;
      
      toast.success('Documento enviado com sucesso!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        shared_with_admin: false
      });
      setDocumentFile(null);
      setIsOpen(false);
      onDocumentAdded();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      toast.error('Erro ao salvar documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="warning" size="sm">
          <Plus size={16} className="mr-2" />
          Novo Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Upload de Arquivo *</label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="document-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('document-upload')?.click()}
                className="w-full"
              >
                <Upload size={16} className="mr-2" />
                Selecionar Arquivo (PNG, JPEG, PDF)
              </Button>
              
              {documentFile && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="text-sm truncate">{documentFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocumentFile(null);
                      setFormData({ ...formData, name: '' });
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Nome do Documento *</label>
            <Input
              placeholder="Nome para identificar o documento"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Descrição do Arquivo</label>
            <Textarea
              placeholder="Descreva o conteúdo ou propósito do documento"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {!isAdmin && (
            <div className="flex items-center space-x-2">
              <Switch
                id="share-admin"
                checked={formData.shared_with_admin}
                onCheckedChange={(checked) => setFormData({ ...formData, shared_with_admin: checked })}
              />
              <label htmlFor="share-admin" className="text-sm font-medium">
                Compartilhar com administrador
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || uploading || !formData.name.trim() || !documentFile}>
              {loading ? 'Salvando...' : uploading ? 'Enviando arquivo...' : 'Salvar Documento'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};