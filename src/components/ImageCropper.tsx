import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Crop, Save, X, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCropped: (croppedImage: Blob) => void;
  aspectRatio?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  onImageCropped,
  aspectRatio = 1
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState({ 
    x: 50, 
    y: 50, 
    width: 200, 
    height: 200 
  });
  const [isMobile, setIsMobile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  React.useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const getTouchPosition = (e: TouchEvent | React.TouchEvent) => {
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (startX: number, startY: number, startCropX: number, startCropY: number, isResize = false, startWidth = 0, startHeight = 0) => {
    return (e: TouchEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      
      const touch = getTouchPosition(e);
      const rect = containerRef.current.getBoundingClientRect();
      
      if (isResize) {
        const deltaX = touch.x - startX;
        const deltaY = touch.y - startY;
        
        const newWidth = Math.max(100, Math.min(rect.width - cropArea.x, startWidth + deltaX));
        const newHeight = aspectRatio === 1 ? newWidth : Math.max(100, Math.min(rect.height - cropArea.y, startHeight + deltaY));
        
        setCropArea(prev => ({ ...prev, width: newWidth, height: newHeight }));
      } else {
        const deltaX = touch.x - startX;
        const deltaY = touch.y - startY;
        
        const newX = Math.max(0, Math.min(rect.width - cropArea.width, startCropX + deltaX));
        const newY = Math.max(0, Math.min(rect.height - cropArea.height, startCropY + deltaY));
        
        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      }
    };
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Arquivo muito grande. Máximo 5MB permitido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const cropImage = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const container = containerRef.current;
    if (!container) return;

    // Calculate scale factors
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Set canvas size to crop area size
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Draw cropped image
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onImageCropped(blob);
        handleClose();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleClose = () => {
    setImage(null);
    setCropArea({ x: 50, y: 50, width: 200, height: 200 });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-background border-border flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Cortar Imagem do Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {!image ? (
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Envie sua foto de perfil
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isMobile ? 'Tire uma foto ou selecione da galeria' : 'Arraste uma imagem aqui ou clique para selecionar'}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {isMobile && (
                    <Button onClick={openCamera} variant="outline" size="lg" className="w-full sm:w-auto">
                      <Camera className="w-4 h-4 mr-2" />
                      Tirar Foto
                    </Button>
                  )}
                  
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg" className="w-full sm:w-auto">
                    <Upload className="w-4 h-4 mr-2" />
                    {isMobile ? 'Galeria' : 'Selecionar Arquivo'}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG ou WebP • Máximo 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Crop Area */}
              <div
                ref={containerRef}
                className="relative mx-auto border border-border rounded-lg overflow-hidden"
                style={{ maxWidth: '600px', maxHeight: '400px' }}
              >
                <img
                  ref={imageRef}
                  src={image}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                
                {/* Crop Overlay */}
                <div
                  className={`absolute border-2 border-primary bg-primary/20 ${isMobile ? 'touch-none' : 'cursor-move'}`}
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                  }}
                  onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startCropX = cropArea.x;
                    const startCropY = cropArea.y;

                    const handleMouseMove = (e: MouseEvent) => {
                      if (!containerRef.current) return;
                      
                      const rect = containerRef.current.getBoundingClientRect();
                      const deltaX = e.clientX - startX;
                      const deltaY = e.clientY - startY;
                      
                      const newX = Math.max(0, Math.min(rect.width - cropArea.width, startCropX + deltaX));
                      const newY = Math.max(0, Math.min(rect.height - cropArea.height, startCropY + deltaY));
                      
                      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = getTouchPosition(e);
                    const startX = touch.x;
                    const startY = touch.y;
                    const startCropX = cropArea.x;
                    const startCropY = cropArea.y;

                    const touchMoveHandler = handleTouchMove(startX, startY, startCropX, startCropY);

                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', touchMoveHandler);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };

                    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                >
                  <div className="absolute inset-0 border-2 border-dashed border-white/50"></div>
                  
                  {/* Resize Handle */}
                  <div
                    className={`absolute bottom-0 right-0 ${isMobile ? 'w-8 h-8 touch-none' : 'w-4 h-4'} bg-primary ${isMobile ? 'cursor-default' : 'cursor-se-resize'} rounded-tl-md flex items-center justify-center`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startWidth = cropArea.width;
                      const startHeight = cropArea.height;

                      const handleMouseMove = (e: MouseEvent) => {
                        if (!containerRef.current) return;
                        
                        const rect = containerRef.current.getBoundingClientRect();
                        const deltaX = e.clientX - startX;
                        const deltaY = e.clientY - startY;
                        
                        const newWidth = Math.max(100, Math.min(rect.width - cropArea.x, startWidth + deltaX));
                        const newHeight = aspectRatio === 1 ? newWidth : Math.max(100, Math.min(rect.height - cropArea.y, startHeight + deltaY));
                        
                        setCropArea(prev => ({ ...prev, width: newWidth, height: newHeight }));
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const touch = getTouchPosition(e);
                      const startX = touch.x;
                      const startY = touch.y;
                      const startWidth = cropArea.width;
                      const startHeight = cropArea.height;

                      const touchMoveHandler = handleTouchMove(startX, startY, cropArea.x, cropArea.y, true, startWidth, startHeight);

                      const handleTouchEnd = () => {
                        document.removeEventListener('touchmove', touchMoveHandler);
                        document.removeEventListener('touchend', handleTouchEnd);
                      };

                      document.addEventListener('touchmove', touchMoveHandler, { passive: false });
                      document.addEventListener('touchend', handleTouchEnd);
                    }}
                  >
                    {isMobile && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center px-4">
                {isMobile ? 'Toque e arraste a área azul para posicionar. Use o círculo no canto para redimensionar.' : 'Arraste a área de corte ou redimensione para ajustar a imagem'}
              </p>
            </div>
          )}
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex-shrink-0 pt-4 border-t border-border bg-background/95 backdrop-blur-sm">
          {image ? (
            <div className={`${isMobile ? 'space-y-2' : 'flex justify-end gap-3'}`}>
              <Button 
                onClick={cropImage} 
                className={`bg-primary hover:bg-primary/90 text-primary-foreground font-semibold ${isMobile ? 'w-full order-1' : ''}`}
                size={isMobile ? "lg" : "default"}
              >
                <Save className="w-4 h-4 mr-2" />
                Confirmar e Salvar Logo
              </Button>
              
              <Button 
                onClick={() => setImage(null)} 
                variant="outline"
                className={isMobile ? 'w-full order-2' : ''}
                size={isMobile ? "lg" : "default"}
              >
                <Upload className="w-4 h-4 mr-2" />
                Trocar Imagem
              </Button>
              
              <Button 
                onClick={handleClose} 
                variant="ghost"
                className={isMobile ? 'w-full order-3' : ''}
                size={isMobile ? "lg" : "default"}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button 
                onClick={handleClose} 
                variant="ghost"
                className={isMobile ? 'w-full' : ''}
                size={isMobile ? "lg" : "default"}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};