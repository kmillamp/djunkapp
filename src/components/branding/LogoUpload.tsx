import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/unk-button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onLogoChange: (url: string) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogoUrl, onLogoChange }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      onLogoChange(data.publicUrl);
      toast.success('Logo enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload do logo');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setPreview('');
    onLogoChange('');
  };

  const displayImage = preview || currentLogoUrl;

  return (
    <div className="space-y-4">
      <h4 className="text-white font-medium">Logo Principal</h4>
      
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div 
          className={`w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed ${
            displayImage ? 'border-white/30' : 'border-white/50'
          } bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/70 transition-colors`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : displayImage ? (
            <img 
              src={displayImage} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          ) : (
            <Upload className="w-8 h-8 text-white/50" />
          )}
        </div>

        {displayImage && !uploading && (
          <Button
            onClick={removeLogo}
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        size="sm"
        disabled={uploading}
        className="w-full text-white border-white/30 hover:bg-white/10"
      >
        <Upload className="w-4 h-4 mr-2" />
        {displayImage ? 'Alterar Logo' : 'Enviar Logo'}
      </Button>
    </div>
  );
};