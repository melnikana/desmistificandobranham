"use client";

import React, { useState } from 'react';
import LexicalEditorComplete from '@/components/admin/LexicalEditorComplete';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CodeBlockPayload } from '@/lib/blocks/types';

interface CodeBlockEditorProps {
  initialPayload?: CodeBlockPayload;
  onChange: (payload: CodeBlockPayload) => void;
  placeholder?: string;
}

const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart', 'html', 'css', 'scss',
  'sql', 'json', 'xml', 'yaml', 'markdown', 'bash', 'shell', 'dockerfile',
];

/**
 * Editor de bloco code_block usando Lexical
 */
export default function CodeBlockEditor({
  initialPayload,
  onChange,
  placeholder = "Digite o código...",
}: CodeBlockEditorProps) {
  const [language, setLanguage] = useState(initialPayload?.language || 'plaintext');

  const handleChange = (data: { text: string; json: any; html?: string }) => {
    onChange({
      lexicalState: data.json,
      html: data.html,
      text: data.text,
      language,
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (initialPayload) {
      onChange({
        ...initialPayload,
        language: newLanguage,
      });
    }
  };

  return (
    <div className="code-block-editor space-y-4">
      <div>
        <Label htmlFor="code-language">Linguagem</Label>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger id="code-language" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
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
    </div>
  );
}


