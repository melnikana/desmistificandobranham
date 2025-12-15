"use client";

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
} from 'lexical';
import { $isQuoteNode } from '@lexical/rich-text';

export default function QuoteEnterPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();
        
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getTopLevelElementOrThrow();

        // Verifica se estamos dentro de um QuoteNode
        if ($isQuoteNode(element)) {
          const textContent = anchorNode.getTextContent();
          const offset = selection.anchor.offset;
          
          // Se a linha atual está vazia (ou só tem espaços) E o cursor está no início/fim
          if (textContent.trim() === '' || (offset === 0 && textContent === '')) {
            // Sai do Quote e cria um parágrafo
            event?.preventDefault();
            
            const newParagraph = $createParagraphNode();
            element.insertAfter(newParagraph);
            newParagraph.select();
            
            return true;
          }
          
          // Caso contrário, permite o comportamento padrão (quebra de linha dentro do Quote)
          return false;
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
}



