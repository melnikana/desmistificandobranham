"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageGalleryModal from '@/components/editor/ImageGalleryModal';
import type { GifBlockPayload } from '@/lib/blocks/types';

interface GifBlockEditorProps {
  initialPayload?: GifBlockPayload;
  onChange: (payload: GifBlockPayload) => void;
}

/**
 * Editor de bloco gif (NÃO usa Lexical)
 */
export default function GifBlockEditor({
  initialPayload,
  onChange,
}: GifBlockEditorProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [payload, setPayload] = useState<GifBlockPayload>(
    initialPayload || {
      url: '',
      alt: '',
    }
  );

  const handleFieldChange = (field: keyof GifBlockPayload, value: any) => {
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
    <div className="gif-block-editor space-y-4 p-4 border rounded-lg">
      <div>
        <Label htmlFor="gif-url">URL do GIF</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="gif-url"
            value={payload.url}
            onChange={(e) => handleFieldChange('url', e.target.value)}
            placeholder="https://... ou use a galeria"
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
        <Label htmlFor="gif-alt">Texto Alternativo</Label>
        <Input
          id="gif-alt"
          value={payload.alt || ''}
          onChange={(e) => handleFieldChange('alt', e.target.value)}
          placeholder="Descrição do GIF"
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


