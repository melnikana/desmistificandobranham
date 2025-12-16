"use client";

import React from 'react';
import LexicalEditorComplete from '@/components/admin/LexicalEditorComplete';
import type { TextBlockPayload } from '@/lib/blocks/types';

interface TextBlockEditorProps {
  initialPayload?: TextBlockPayload;
  onChange: (payload: TextBlockPayload) => void;
  placeholder?: string;
}

/**
 * Editor de bloco text (parágrafo normal) usando Lexical
 */
export default function TextBlockEditor({
  initialPayload,
  onChange,
  placeholder = "Digite seu texto...",
}: TextBlockEditorProps) {
  const handleChange = (data: { text: string; json: any; html?: string }) => {
    onChange({
      lexicalState: data.json,
      html: data.html,
      text: data.text,
    });
  };

  return (
    <div className="text-block-editor">
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


