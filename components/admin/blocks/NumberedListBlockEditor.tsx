"use client";

import React from 'react';
import LexicalEditorComplete from '@/components/admin/LexicalEditorComplete';
import type { NumberedListBlockPayload } from '@/lib/blocks/types';

interface NumberedListBlockEditorProps {
  initialPayload?: NumberedListBlockPayload;
  onChange: (payload: NumberedListBlockPayload) => void;
  placeholder?: string;
}

/**
 * Editor de bloco numbered_list usando Lexical
 */
export default function NumberedListBlockEditor({
  initialPayload,
  onChange,
  placeholder = "Digite os itens da lista numerada...",
}: NumberedListBlockEditorProps) {
  const handleChange = (data: { text: string; json: any; html?: string }) => {
    onChange({
      lexicalState: data.json,
      html: data.html,
      text: data.text,
    });
  };

  return (
    <div className="numbered-list-block-editor">
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


