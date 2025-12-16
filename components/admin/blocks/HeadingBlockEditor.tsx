"use client";

import React from 'react';
import LexicalEditorComplete from '@/components/admin/LexicalEditorComplete';
import type { HeadingBlockPayload } from '@/lib/blocks/types';

interface HeadingBlockEditorProps {
  initialPayload?: HeadingBlockPayload;
  onChange: (payload: HeadingBlockPayload) => void;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Editor de bloco heading usando Lexical
 */
export default function HeadingBlockEditor({
  initialPayload,
  onChange,
  level = 1,
}: HeadingBlockEditorProps) {
  const handleChange = (data: { text: string; json: any; html?: string }) => {
    onChange({
      level: initialPayload?.level || level,
      lexicalState: data.json,
      html: data.html,
      text: data.text,
    });
  };

  return (
    <div className="heading-block-editor">
      <LexicalEditorComplete
        onChange={handleChange}
        placeholder={`Digite o título (H${level})...`}
        initialContent={
          initialPayload?.lexicalState
            ? JSON.stringify(initialPayload.lexicalState)
            : undefined
        }
      />
    </div>
  );
}


