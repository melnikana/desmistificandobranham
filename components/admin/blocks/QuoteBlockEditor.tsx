"use client";

import React from 'react';
import LexicalEditorComplete from '@/components/admin/LexicalEditorComplete';
import type { QuoteBlockPayload } from '@/lib/blocks/types';

interface QuoteBlockEditorProps {
  initialPayload?: QuoteBlockPayload;
  onChange: (payload: QuoteBlockPayload) => void;
  placeholder?: string;
}

/**
 * Editor de bloco quote usando Lexical
 */
export default function QuoteBlockEditor({
  initialPayload,
  onChange,
  placeholder = "Digite a citação...",
}: QuoteBlockEditorProps) {
  const handleChange = (data: { text: string; json: any; html?: string }) => {
    onChange({
      lexicalState: data.json,
      html: data.html,
      text: data.text,
    });
  };

  return (
    <div className="quote-block-editor">
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


