"use client";

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
  KEY_SPACE_COMMAND,
} from 'lexical';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { $isParagraphNode } from 'lexical';

/**
 * Plugin que transforma automaticamente parágrafos contendo "---" em HorizontalRuleNode
 * quando o usuário pressiona espaço ou enter, estilo Notion.
 */
export default function HorizontalRuleTransformPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Interceptar comandos de teclado (espaço e enter)
    const removeSpaceCommand = editor.registerCommand(
      KEY_SPACE_COMMAND,
      (event: KeyboardEvent | null) => {
        const selection = $getSelection();
        
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        const paragraphNode = anchorNode.getTopLevelElementOrThrow();
        
        // Verificar se é um parágrafo
        if (!$isParagraphNode(paragraphNode)) {
          return false;
        }

        const text = paragraphNode.getTextContent();
        
        // Verificar se o texto é exatamente "---" ou começa com "---" seguido de espaços
        if (text.trim() === '---' || (text.startsWith('---') && text.trim().length === 3)) {
          event?.preventDefault();
          
          editor.update(() => {
            const currentSelection = $getSelection();
            if (!$isRangeSelection(currentSelection)) return;
            
            const currentAnchorNode = currentSelection.anchor.getNode();
            const currentParagraph = currentAnchorNode.getTopLevelElementOrThrow();
            
            if (!$isParagraphNode(currentParagraph)) return;
            
            // Criar HR e novo parágrafo
            const hrNode = new HorizontalRuleNode();
            const newParagraph = $createParagraphNode();
            
            // Substituir parágrafo atual pelo HR
            currentParagraph.replace(hrNode);
            hrNode.insertAfter(newParagraph);
            
            // Mover cursor para o novo parágrafo
            newParagraph.selectStart();
          });
          
          return true;
        }
        
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    const removeEnterCommand = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        const selection = $getSelection();
        
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        const paragraphNode = anchorNode.getTopLevelElementOrThrow();
        
        // Verificar se é um parágrafo
        if (!$isParagraphNode(paragraphNode)) {
          return false;
        }

        const text = paragraphNode.getTextContent();
        
        // Verificar se o texto é exatamente "---" ou começa com "---" seguido de espaços
        if (text.trim() === '---' || (text.startsWith('---') && text.trim().length === 3)) {
          event?.preventDefault();
          
          editor.update(() => {
            const currentSelection = $getSelection();
            if (!$isRangeSelection(currentSelection)) return;
            
            const currentAnchorNode = currentSelection.anchor.getNode();
            const currentParagraph = currentAnchorNode.getTopLevelElementOrThrow();
            
            if (!$isParagraphNode(currentParagraph)) return;
            
            // Criar HR e novo parágrafo
            const hrNode = new HorizontalRuleNode();
            const newParagraph = $createParagraphNode();
            
            // Substituir parágrafo atual pelo HR
            currentParagraph.replace(hrNode);
            hrNode.insertAfter(newParagraph);
            
            // Mover cursor para o novo parágrafo
            newParagraph.selectStart();
          });
          
          return true;
        }
        
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeSpaceCommand();
      removeEnterCommand();
    };
  }, [editor]);

  return null;
}

