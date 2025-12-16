"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SeparatorBlockPayload } from '@/lib/blocks/types';

interface SeparatorBlockEditorProps {
  initialPayload?: SeparatorBlockPayload;
  onChange: (payload: SeparatorBlockPayload) => void;
}

/**
 * Editor de bloco separator (NÃO usa Lexical)
 */
export default function SeparatorBlockEditor({
  initialPayload,
  onChange,
}: SeparatorBlockEditorProps) {
  const style = initialPayload?.style || 'solid';

  const handleStyleChange = (newStyle: 'solid' | 'dashed' | 'dotted') => {
    onChange({ style: newStyle });
  };

  return (
    <div className="separator-block-editor p-4 border rounded-lg">
      <Label htmlFor="separator-style">Estilo da Linha</Label>
      <Select value={style} onValueChange={handleStyleChange}>
        <SelectTrigger id="separator-style" className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="solid">Sólida</SelectItem>
          <SelectItem value="dashed">Tracejada</SelectItem>
          <SelectItem value="dotted">Pontilhada</SelectItem>
        </SelectContent>
      </Select>

      <div className="mt-4">
        <hr
          style={{
            border: 'none',
            borderTop: `2px ${style} #d1d5db`,
            margin: '1rem 0',
          }}
        />
      </div>
    </div>
  );
}


