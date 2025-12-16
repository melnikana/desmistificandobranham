"use client";

import React from 'react';
import LexicalEditorComplete from '@/components/admin/LexicalEditorComplete';
import type { BulletListBlockPayload } from '@/lib/blocks/types';

interface BulletListBlockEditorProps {
  initialPayload?: BulletListBlockPayload;
  onChange: (payload: BulletListBlockPayload) => void;
  placeholder?: string;
}

/**
 * Editor de bloco bullet_list usando Lexical
 */
export default function BulletListBlockEditor({
  initialPayload,
  onChange,
  placeholder = "Digite os itens da lista...",
}: BulletListBlockEditorProps) {
  const handleChange = (data: { text: string; json: any; html?: string }) => {
    onChange({
      lexicalState: data.json,
      html: data.html,
      text: data.text,
    });
  };

  return (
    <div className="bullet-list-block-editor">
      <LexicalEditorComplete
        onChange={handleChange}
        placeholder={placeholder}
        initialContent={
          initialPayload?.lexicalState
            ? JSON.stringify(initialPayload.lexicalState)
            : undefined
        }
      />
    </div>
  );
}


