import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket: string;
  onUpload: (url: string) => void;
  value?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  bucket,
  onUpload,
  value,
  className = '',
  accept = 'image/*',
  maxSize = 5,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${maxSize}MB.`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas.');
      return;
    }

    try {
      setUploading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onUpload(publicUrl);
      toast.success('Imagem enviada com sucesso!');

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-32 bg-background border-2 border-dashed border-border rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || uploading}
              >
                <X className="w-4 h-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`
            w-full h-32 bg-background border-2 border-dashed border-border rounded-lg 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-primary/50 hover:bg-primary/5 transition-colors
            ${disabled || uploading ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <span className="text-sm text-muted-foreground">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground text-center">
                Clique para enviar uma imagem
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Máximo {maxSize}MB
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;