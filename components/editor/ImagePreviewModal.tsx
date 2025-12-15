"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageFile } from '@/lib/imageUploadService';
import { X, Check, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImagePreviewModalProps {
  image: ImageFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (image: ImageFile) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigate?: { prev: boolean; next: boolean };
  showSelectButton?: boolean;
}

export default function ImagePreviewModal({
  image,
  isOpen,
  onClose,
  onSelect,
  onNavigate,
  canNavigate = { prev: false, next: false },
  showSelectButton = true,
}: ImagePreviewModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!image) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(image.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(image);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate pr-4">{image.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Imagem */}
          <div className="relative bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
            <img
              src={image.url}
              alt={image.name}
              className="max-w-full max-h-[60vh] object-contain"
            />

            {/* Navegação */}
            {onNavigate && (
              <>
                {canNavigate.prev && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0 shadow-lg"
                    onClick={() => onNavigate('prev')}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                {canNavigate.next && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0 shadow-lg"
                    onClick={() => onNavigate('next')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Metadados */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
            <div>
              <span className="text-gray-500 font-medium">Nome:</span>
              <p className="text-gray-900 truncate mt-1">{image.name}</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Tamanho:</span>
              <p className="text-gray-900 mt-1">{image.formattedSize}</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Data:</span>
              <p className="text-gray-900 mt-1">{image.formattedDate}</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Caminho:</span>
              <p className="text-gray-900 truncate mt-1 text-xs">{image.path}</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCopyUrl}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar URL
                </>
              )}
            </Button>

            {showSelectButton && onSelect && (
              <Button onClick={handleSelect} className="gap-2">
                <Check className="h-4 w-4" />
                Selecionar Imagem
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



