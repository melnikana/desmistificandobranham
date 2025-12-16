"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import LexicalEditorComplete from '@/components/admin/LexicalEditorComplete';
import type { CitacaoBranhamBlockPayload } from '@/lib/blocks/types';

interface CitacaoBranhamBlockEditorProps {
  initialPayload?: CitacaoBranhamBlockPayload;
  onChange: (payload: CitacaoBranhamBlockPayload) => void;
}

/**
 * Editor de bloco citacao_branham (bloco customizado)
 * Lexical é usado apenas opcionalmente para o campo de texto
 */
export default function CitacaoBranhamBlockEditor({
  initialPayload,
  onChange,
}: CitacaoBranhamBlockEditorProps) {
  const [text, setText] = useState(initialPayload?.text || '');
  const [source, setSource] = useState(initialPayload?.source || '');
  const [translation, setTranslation] = useState(initialPayload?.translation || '');
  const [useLexical, setUseLexical] = useState(!!initialPayload?.lexicalState);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onChange({
      text: newText,
      source,
      translation,
      lexicalState: initialPayload?.lexicalState,
      html: initialPayload?.html,
    });
  };

  const handleSourceChange = (newSource: string) => {
    setSource(newSource);
    onChange({
      text,
      source: newSource,
      translation,
      lexicalState: initialPayload?.lexicalState,
      html: initialPayload?.html,
    });
  };

  const handleTranslationChange = (newTranslation: string) => {
    setTranslation(newTranslation);
    onChange({
      text,
      source,
      translation: newTranslation,
      lexicalState: initialPayload?.lexicalState,
      html: initialPayload?.html,
    });
  };

  const handleLexicalChange = (data: { text: string; json: any; html?: string }) => {
    onChange({
      text: data.text || text,
      source,
      translation,
      lexicalState: data.json,
      html: data.html,
    });
  };

  return (
    <div className="citacao-branham-block-editor space-y-4 p-4 border rounded-lg">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Citação Branham
      </div>

      <div>
        <Label htmlFor="citacao-text">Texto da Citação</Label>
        {useLexical ? (
          <div className="mt-1">
            <LexicalEditorComplete
              onChange={handleLexicalChange}
              placeholder="Digite a citação..."
              initialContent={
                initialPayload?.lexicalState
                  ? JSON.stringify(initialPayload.lexicalState)
                  : undefined
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUseLexical(false)}
              className="mt-2"
            >
              Usar texto simples
            </Button>
          </div>
        ) : (
          <div className="mt-1">
            <Textarea
              id="citacao-text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Digite a citação..."
              rows={4}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUseLexical(true)}
              className="mt-2"
            >
              Usar editor rico (Lexical)
            </Button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="citacao-source">Fonte/Referência</Label>
        <Input
          id="citacao-source"
          value={source}
          onChange={(e) => handleSourceChange(e.target.value)}
          placeholder="Ex: Sermão 123, página 45"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="citacao-translation">Tradução (opcional)</Label>
        <Input
          id="citacao-translation"
          value={translation}
          onChange={(e) => handleTranslationChange(e.target.value)}
          placeholder="Tradução ou observação"
          className="mt-1"
        />
      </div>
    </div>
  );
}

