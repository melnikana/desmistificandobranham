"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageGalleryModal from '@/components/editor/ImageGalleryModal';
import type { ImageBlockPayload } from '@/lib/blocks/types';

interface ImageBlockEditorProps {
  initialPayload?: ImageBlockPayload;
  onChange: (payload: ImageBlockPayload) => void;
}

/**
 * Editor de bloco image (NÃO usa Lexical)
 */
export default function ImageBlockEditor({
  initialPayload,
  onChange,
}: ImageBlockEditorProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [payload, setPayload] = useState<ImageBlockPayload>(
    initialPayload || {
      url: '',
      alt: '',
      caption: '',
    }
  );

  const handleFieldChange = (field: keyof ImageBlockPayload, value: any) => {
    const newPayload = { ...payload, [field]: value };
    setPayload(newPayload);
    onChange(newPayload);
  };

  const handleImageSelect = (url: string, alt?: string) => {
    const newPayload = { ...payload, url, alt: alt || payload.alt };
    setPayload(newPayload);
    onChange(newPayload);
    setShowGallery(false);
  };

  return (
    <div className="image-block-editor space-y-4 p-4 border rounded-lg">
      <div>
        <Label htmlFor="image-url">URL da Imagem</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="image-url"
            value={payload.url}
            onChange={(e) => handleFieldChange('url', e.target.value)}
            placeholder="https://..."
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowGallery(true)}
          >
            Galeria
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="image-alt">Texto Alternativo</Label>
        <Input
          id="image-alt"
          value={payload.alt || ''}
          onChange={(e) => handleFieldChange('alt', e.target.value)}
          placeholder="Descrição da imagem"
        />
      </div>

      <div>
        <Label htmlFor="image-caption">Legenda</Label>
        <Input
          id="image-caption"
          value={payload.caption || ''}
          onChange={(e) => handleFieldChange('caption', e.target.value)}
          placeholder="Legenda opcional"
        />
      </div>

      {payload.url && (
        <div className="mt-4">
          <img
            src={payload.url}
            alt={payload.alt || ''}
            className="max-w-full h-auto rounded border"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}

      <ImageGalleryModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onSelectImage={handleImageSelect}
        type="posts"
      />
    </div>
  );
}


