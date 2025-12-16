"use client";

import React from 'react';
import LexicalEditorComplete from '@/components/admin/LexicalEditorComplete';
import type { LexicalBlockPayload } from '@/lib/blocks/types';

interface RichTextBlockEditorProps {
  initialPayload?: LexicalBlockPayload;
  onChange: (payload: LexicalBlockPayload) => void;
  placeholder?: string;
}

/**
 * Editor de bloco rich_text usando Lexical
 */
export default function RichTextBlockEditor({
  initialPayload,
  onChange,
  placeholder = "Digite seu texto...",
}: RichTextBlockEditorProps) {
  const handleChange = (data: { text: string; json: any; html?: string }) => {
    onChange({
      lexicalState: data.json,
      html: data.html,
      text: data.text,
    });
  };

  return (
    <div className="rich-text-block-editor">
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


