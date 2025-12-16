"use client";

import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, LexicalEditor, $getSelection, $isRangeSelection, KEY_BACKSPACE_COMMAND, KEY_ENTER_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { $generateHtmlFromNodes } from "@lexical/html";
import FloatingToolbarPlugin from "@/components/editor/FloatingToolbarPlugin";
import SlashCommandPlugin from "@/components/editor/SlashCommandPlugin";
import QuoteEnterPlugin from "@/components/editor/QuoteEnterPlugin";
import HorizontalRuleTransformPlugin from "@/components/editor/HorizontalRuleTransformPlugin";
import { TranslationQuoteNode } from "@/components/editor/nodes/TranslationQuoteNode";
import type { PostBlock } from "@/lib/blocks/types";

interface LexicalBlockEditorProps {
  block: PostBlock;
  onUpdate: (payload: any) => void;
  onDeleteBlock?: () => void;
  onFocusPrevious?: () => void;
  onCreateBlockBelow?: () => void;
  isFirstBlock?: boolean;
  onCheckEmpty?: (checkFn: () => boolean) => void;
  onCancelCitacaoBranham?: () => void;
  onSaveCitacaoBranham?: () => void;
  onTransformBlock?: (newType: string) => void;
  onAddBlock?: (type: string, position: number) => void;
}

/**
 * Editor Lexical isolado para um único bloco textual
 * Cada instância tem seu próprio LexicalComposer
 */
function EditorStateListener({ block, onUpdate }: { block: PostBlock; onUpdate: (payload: any) => void }) {
  const [editor] = useLexicalComposerContext();
  
  // Capturar o tipo do bloco uma vez no mount
  const blockTypeRef = React.useRef(block?.type || 'text');
  React.useEffect(() => {
    blockTypeRef.current = block?.type || 'text';
  }, [block?.type]);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const text = root.getTextContent();
        let json: any = null;
        let html: string | null = null;

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:EditorStateListener',message:'EditorStateListener update',data:{blockType:blockTypeRef.current,childrenCount:children.length,childrenTypes:children.map(c=>c.getType())},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

        try {
          json = editorState.toJSON ? editorState.toJSON() : null;
        } catch (e) {
          json = null;
        }

        try {
          html = $generateHtmlFromNodes(editor);
        } catch (e) {
          html = null;
        }

        // Usar o tipo do bloco do ref (mais seguro)
        const blockType = blockTypeRef.current;

        // Criar payload baseado no tipo
        let payload: any = {
          lexicalState: json,
          html: html || undefined,
          text: text || '',
        };

        // Adicionar propriedades específicas do tipo
        if (blockType === 'heading') {
          editor.getEditorState().read(() => {
            const root = $getRoot();
            const firstChild = root.getFirstChild();
            if (firstChild) {
              const nodeType = (firstChild as any).__type || firstChild.getType();
              if (nodeType === 'heading') {
                const tag = (firstChild as any).__tag || 'h1';
                const level = parseInt(tag.replace('h', '')) || 1;
                payload.level = level as 1 | 2 | 3 | 4 | 5 | 6;
              }
            }
          });
        }

        if (blockType === 'code_block') {
          editor.getEditorState().read(() => {
            const root = $getRoot();
            const firstChild = root.getFirstChild();
            if (firstChild) {
              const nodeType = (firstChild as any).__type || firstChild.getType();
              if (nodeType === 'code') {
                payload.language = (firstChild as any).__language || 'plaintext';
              }
            }
          });
        }

        onUpdate(payload);
      });
    });
  }, [editor, onUpdate]);

  return null;
}

function BackspaceDeletePlugin({ isFirstBlock }: { isFirstBlock?: boolean }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event: KeyboardEvent | null) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const root = $getRoot();
        const text = root.getTextContent().trim();
        
        // Se o bloco está completamente vazio (sem texto), não processar aqui
        // Deixar o BlockWrapper interceptar e processar
        // Apenas garantir que o primeiro bloco não seja deletado
        if (text === '') {
          if (isFirstBlock) {
            // Prevenir comportamento padrão do Lexical para o primeiro bloco vazio
            return true;
          }
          // Retornar false para permitir que o evento seja processado pelo BlockWrapper
          return false;
        }

        // Para blocos com conteúdo, permitir comportamento padrão do Lexical
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, isFirstBlock]);

  return null;
}

function EnterToNewBlockPlugin({ onCreateBlockBelow }: { onCreateBlockBelow?: () => void }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:EnterToNewBlockPlugin',message:'ENTER key pressed',data:{hasOnCreateBlockBelow:!!onCreateBlockBelow,shiftKey:event?.shiftKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (!onCreateBlockBelow) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:EnterToNewBlockPlugin',message:'onCreateBlockBelow is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          return false;
        }

        // Se Shift está pressionado, permitir quebra de linha normal
        if (event?.shiftKey) {
          return false;
        }

        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        const root = $getRoot();
        const text = root.getTextContent().trim();
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:EnterToNewBlockPlugin',message:'Block content check',data:{textLength:text.length,isEmpty:text===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Se o bloco está completamente vazio, criar novo bloco abaixo
        if (text === '') {
          event?.preventDefault();
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:EnterToNewBlockPlugin',message:'Calling onCreateBlockBelow (empty block)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          setTimeout(() => {
            onCreateBlockBelow();
          }, 0);
          return true;
        }

        // Verificar se estamos no final do último elemento
        const anchorNode = selection.anchor.getNode();
        const topLevelElement = anchorNode.getTopLevelElement();
        
        if (topLevelElement) {
          const lastChild = topLevelElement.getLastChild();
          const isInLastChild = anchorNode === lastChild || anchorNode.isParentOf(lastChild);
          const offset = selection.anchor.offset;
          const nodeText = anchorNode.getTextContent();
          const isAtEndOfNode = offset >= nodeText.length;
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:EnterToNewBlockPlugin',message:'End of block check',data:{isInLastChild,isAtEndOfNode,offset,nodeTextLength:nodeText.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          // Se estamos no último elemento e no final do texto, criar novo bloco
          if (isInLastChild && isAtEndOfNode) {
            event?.preventDefault();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:EnterToNewBlockPlugin',message:'Calling onCreateBlockBelow (end of block)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            setTimeout(() => {
              onCreateBlockBelow();
            }, 0);
            return true;
          }
        }

        // Permitir comportamento padrão do ENTER (quebras de linha) em outros casos
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, onCreateBlockBelow]);

  return null;
}

/**
 * Componente interno que expõe função de verificação de bloco vazio
 */
function EmptyCheckProvider({ onCheckEmpty }: { onCheckEmpty?: (checkFn: () => boolean) => void }) {
  const [editor] = useLexicalComposerContext();

  const checkIfEmpty = React.useCallback(() => {
    const result = editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      
      // Deve ter exatamente 1 filho (parágrafo ou outro elemento de nível superior)
      if (children.length !== 1) {
        console.log('[EmptyCheckProvider] Not empty: has', children.length, 'children');
        return false;
      }
      
      const firstChild = children[0];
      const nodeType = firstChild.getType();
      
      // Para parágrafos, verificar se está vazio
      if (nodeType === 'paragraph') {
        const text = firstChild.getTextContent().trim();
        if (text !== '') {
          console.log('[EmptyCheckProvider] Not empty: paragraph has text:', text);
          return false;
        }
        
        // Cursor deve estar no início
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          console.log('[EmptyCheckProvider] Not empty: no range selection');
          return false;
        }
        
        const offset = selection.anchor.offset;
        const isEmpty = offset === 0;
        console.log('[EmptyCheckProvider] Paragraph empty check:', isEmpty, 'offset:', offset);
        return isEmpty;
      }
      
      // Para outros tipos (heading, quote, etc.), verificar se está vazio
      const text = firstChild.getTextContent().trim();
      if (text !== '') {
        console.log('[EmptyCheckProvider] Not empty:', nodeType, 'has text:', text);
        return false;
      }
      
      // Cursor deve estar no início
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        console.log('[EmptyCheckProvider] Not empty: no range selection');
        return false;
      }
      
      const offset = selection.anchor.offset;
      const isEmpty = offset === 0;
      console.log('[EmptyCheckProvider]', nodeType, 'empty check:', isEmpty, 'offset:', offset);
      return isEmpty;
    });
    
    console.log('[EmptyCheckProvider] Final result:', result);
    return result;
  }, [editor]);

  React.useEffect(() => {
    if (onCheckEmpty) {
      onCheckEmpty(checkIfEmpty);
    }
  }, [onCheckEmpty, checkIfEmpty]);

  return null;
}

/**
 * Plugin que detecta inserção de TranslationQuoteNode e transforma o bloco
 */
function TranslationQuoteTransformPlugin({ onTransformBlock, blockType }: { onTransformBlock?: (newType: string) => void; blockType: string }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    // Só transformar se o bloco ainda não é citacao_branham
    if (blockType === 'citacao_branham' || !onTransformBlock) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TranslationQuoteTransformPlugin',message:'Plugin skipped',data:{blockType,hasOnTransformBlock:!!onTransformBlock},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TranslationQuoteTransformPlugin',message:'Plugin registered',data:{blockType},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    let hasTransformed = false; // Prevenir múltiplas transformações

    return editor.registerUpdateListener(({ editorState, prevEditorState }) => {
      // Pular se já transformou
      if (hasTransformed) {
        return;
      }

      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TranslationQuoteTransformPlugin',message:'Checking for TranslationQuoteNode',data:{childrenCount:children.length,childrenTypes:children.map(c=>c.getType())},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Verificar se há um TranslationQuoteNode
        for (const child of children) {
          const nodeType = child.getType();
          if (nodeType === 'translation-quote') {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TranslationQuoteTransformPlugin',message:'TranslationQuoteNode found, transforming block',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            // Transformar o bloco para citacao_branham
            hasTransformed = true;
            onTransformBlock('citacao_branham');
            return;
          }
        }
      });
    });
  }, [editor, onTransformBlock, blockType]);

  return null;
}

/**
 * Plugin que expõe função de adicionar blocos globalmente
 */
function AddBlockProvider({ onAddBlock }: { onAddBlock?: (type: string, position: number) => void }) {
  React.useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:AddBlockProvider',message:'AddBlockProvider useEffect',data:{hasOnAddBlock:!!onAddBlock},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    
    if (onAddBlock) {
      (window as any).__addBlock = onAddBlock;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:AddBlockProvider',message:'addBlockFn exposed globally',data:{windowHasAddBlockFn:!!(window as any).__addBlock},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:AddBlockProvider',message:'onAddBlock is undefined/null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
    }
    return () => {
      if ((window as any).__addBlock) {
        delete (window as any).__addBlock;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:AddBlockProvider',message:'Cleaned up addBlockFn',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
      }
    };
  }, [onAddBlock]);
  return null;
}

/**
 * Plugin que expõe função de transformação de blocos globalmente
 */
function TransformBlockProvider({ onTransformBlock }: { onTransformBlock?: (newType: string) => void }) {
  // #region agent log
  // Log imediato no render
  try {
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TransformBlockProvider',message:'TransformBlockProvider render',data:{hasOnTransformBlock:!!onTransformBlock,onTransformBlockType:typeof onTransformBlock},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
  } catch (e) {
    console.error('Error logging TransformBlockProvider render:', e);
  }
  // #endregion
  
  React.useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TransformBlockProvider',message:'TransformBlockProvider useEffect',data:{hasOnTransformBlock:!!onTransformBlock},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    
    if (onTransformBlock) {
      (window as any).__transformBlock = onTransformBlock;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TransformBlockProvider',message:'transformBlockFn exposed globally',data:{windowHasTransformFn:!!(window as any).__transformBlock},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TransformBlockProvider',message:'onTransformBlock is undefined/null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
    }
    return () => {
      if ((window as any).__transformBlock) {
        delete (window as any).__transformBlock;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:TransformBlockProvider',message:'Cleaned up transformBlockFn',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
      }
    };
  }, [onTransformBlock]);
  return null;
}

/**
 * Plugin que expõe função de cancelamento para Citação Branham
 */
function CancelCitacaoBranhamProvider({ onCancel }: { onCancel?: () => void }) {
  React.useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:CancelCitacaoBranhamProvider',message:'Provider mounted',data:{hasOnCancel:!!onCancel,onCancelType:typeof onCancel},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    if (onCancel) {
      // Expor função globalmente para o TranslationQuoteNode acessar
      (window as any).__cancelCitacaoBranham = onCancel;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:CancelCitacaoBranhamProvider',message:'Exposed cancelFn globally',data:{windowHasCancelFn:!!(window as any).__cancelCitacaoBranham},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:CancelCitacaoBranhamProvider',message:'onCancel is undefined/null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    }
    return () => {
      if ((window as any).__cancelCitacaoBranham) {
        delete (window as any).__cancelCitacaoBranham;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:CancelCitacaoBranhamProvider',message:'Cleaned up cancelFn',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      }
    };
  }, [onCancel]);
  return null;
}

export default function LexicalBlockEditor({ block, onUpdate, onDeleteBlock, onFocusPrevious, onCreateBlockBelow, isFirstBlock = false, onCheckEmpty, onCancelCitacaoBranham, onSaveCitacaoBranham, onTransformBlock }: LexicalBlockEditorProps) {
  // #region agent log
  // Log imediato no render (não em useEffect)
  try {
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:render',message:'LexicalBlockEditor rendered',data:{blockId:block?.id,blockType:block?.type,hasOnTransformBlock:!!onTransformBlock,hasOnCancel:!!onCancelCitacaoBranham,onTransformBlockType:typeof onTransformBlock},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'E'})}).catch(()=>{});
  } catch (e) {
    console.error('Error logging LexicalBlockEditor render:', e);
  }
  // #endregion
  
  if (block.type === 'citacao_branham') {
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:render',message:'LexicalBlockEditor rendering citacao_branham',data:{blockId:block.id,hasOnCancel:!!onCancelCitacaoBranham,hasOnSave:!!onSaveCitacaoBranham,onCancelType:typeof onCancelCitacaoBranham},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
  }
  
  React.useEffect(() => {
    if (block.type === 'citacao_branham') {
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:component',message:'LexicalBlockEditor mounted for citacao_branham',data:{blockId:block.id,hasOnCancel:!!onCancelCitacaoBranham,hasOnSave:!!onSaveCitacaoBranham},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    }
  }, [block.id, block.type, onCancelCitacaoBranham, onSaveCitacaoBranham]);
  // #endregion
  
  // Função helper para criar estado inicial baseado no tipo de bloco
  const createDefaultLexicalState = (blockType: string, payload: any): string => {
    const baseRoot = {
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1
    };

    let firstChild: any;

    switch (blockType) {
      case 'heading': {
        const level = Math.max(1, Math.min(6, payload?.level || 1));
        firstChild = {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "heading",
          tag: `h${level}`,
          version: 1
        };
        break;
      }

      case 'quote': {
        firstChild = {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "quote",
          version: 1
        };
        break;
      }

      case 'code_block': {
        firstChild = {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "code",
          language: payload?.language || 'plaintext',
          version: 1
        };
        break;
      }

      case 'bullet_list': {
        firstChild = {
          children: [
            {
              children: [
                {
                  children: [],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              value: 1,
              version: 1
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          listType: "bullet",
          start: 1,
          tag: "ul",
          type: "list",
          version: 1
        };
        break;
      }

      case 'numbered_list': {
        firstChild = {
          children: [
            {
              children: [
                {
                  children: [],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "listitem",
              value: 1,
              version: 1
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          listType: "number",
          start: 1,
          tag: "ol",
          type: "list",
          version: 1
        };
        break;
      }

      case 'citacao_branham': {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:createDefaultLexicalState',message:'Creating citacao_branham lexical state',data:{payloadLexicalState:payload?.lexicalState?.root?.children?.[0]?.isSaved,hasLexicalState:!!payload?.lexicalState},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        // Ler isSaved do lexicalState se disponível, senão usar false (modo edição)
        const isSavedValue = payload?.lexicalState?.root?.children?.[0]?.isSaved ?? false;
        
        firstChild = {
          text: payload?.text || '',
          html: payload?.html || '',
          editorState: payload?.editorState || '',
          source: payload?.source || 'recordings',
          isSaved: isSavedValue,
          type: "translation-quote",
          version: 1
        };
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:createDefaultLexicalState',message:'Created firstChild for citacao_branham',data:{firstChildIsSaved:firstChild.isSaved},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        break;
      }

      default: // text ou outros
        firstChild = {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1
        };
    }

    return JSON.stringify({
      root: {
        ...baseRoot,
        children: [firstChild]
      }
    });
  };

  // Preparar conteúdo inicial do bloco
  const initialContent = React.useMemo(() => {
    if (!block || !block.payload) {
      // Criar estado inicial vazio válido baseado no tipo
      return createDefaultLexicalState(block?.type || 'text', {});
    }

    const payload = block.payload as any;
    if (payload?.lexicalState) {
      // Validar se o lexicalState tem a estrutura correta
      const lexicalState = payload.lexicalState;

      // Verificar se tem estrutura válida (root com type)
      if (lexicalState && typeof lexicalState === 'object' && lexicalState.root && lexicalState.root.type === 'root') {
        return JSON.stringify(lexicalState);
      } else {
        // Estado inválido, criar um válido baseado no tipo
        return createDefaultLexicalState(block.type, payload);
      }
    }

    // Sem lexicalState, criar estado inicial baseado no tipo
    return createDefaultLexicalState(block.type, payload);
  }, [block?.id, block?.type]); // Recalcular se ID ou tipo mudar


  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:initialConfig',message:'Checking TranslationQuoteNode registration',data:{blockId:block?.id,blockType:block?.type,hasTranslationQuoteNode:!!TranslationQuoteNode,nodeType:TranslationQuoteNode?.getType?.()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  }, [block?.id, block?.type]);
  // #endregion
  
  const initialConfig = {
    namespace: `BlockEditor-${block?.id || 'unknown'}`,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HorizontalRuleNode,
      TranslationQuoteNode,
    ],
    editorState: initialContent || undefined,
    onError: (error: Error, editor: LexicalEditor) => {
      console.error(`Error in block ${block?.id}:`, error);
    },
    theme: {
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        code: "bg-code-highlight",
      },
      code: "code-block-custom",
      heading: {
        h1: "text-4xl font-bold mb-4",
        h2: "text-3xl font-bold mb-3",
        h3: "text-2xl font-bold mb-2",
        h4: "text-xl font-bold mb-2",
        h5: "text-lg font-bold mb-2",
        h6: "text-base font-bold mb-2",
      },
      list: {
        nested: {
          listitem: "list-item ml-4",
        },
        ol: "list-decimal list-inside",
        ul: "list-disc list-inside",
        listitem: "list-item",
      },
      link: "text-blue-600 underline cursor-pointer",
      quote: "border-l-2 pl-4 italic my-2 blockquote-custom",
      horizontalRule: "horizontal-rule-custom",
      codeHighlight: {
        atrule: "color: rgb(136, 19, 145)",
        attr: "color: rgb(153, 153, 153)",
        boolean: "color: rgb(136, 19, 145)",
        builtin: "color: rgb(6, 90, 143)",
        cdata: "color: rgb(107, 107, 107)",
        char: "color: rgb(206, 145, 120)",
        class: "color: rgb(255, 157, 167)",
        "class-name": "color: rgb(255, 157, 167)",
        comment: "color: rgb(107, 107, 107)",
        constant: "color: rgb(189, 16, 224)",
        deleted: "color: rgb(206, 145, 120)",
        doctype: "color: rgb(107, 107, 107)",
        entity: "color: rgb(206, 145, 120)",
        function: "color: rgb(6, 90, 143)",
        important: "color: rgb(188, 63, 60)",
        inserted: "color: rgb(19, 161, 14)",
        keyword: "color: rgb(136, 19, 145)",
        namespace: "color: rgb(255, 157, 167)",
        number: "color: rgb(189, 16, 224)",
        operator: "color: rgb(107, 107, 107)",
        prolog: "color: rgb(107, 107, 107)",
        property: "color: rgb(153, 153, 153)",
        pseudoclass: "color: rgb(206, 145, 120)",
        pseudoelement: "color: rgb(206, 145, 120)",
        punctuation: "color: rgb(107, 107, 107)",
        regex: "color: rgb(206, 145, 120)",
        selector: "color: rgb(206, 145, 120)",
        string: "color: rgb(19, 161, 14)",
        symbol: "color: rgb(189, 16, 224)",
        tag: "color: rgb(136, 19, 145)",
        unit: "color: rgb(189, 16, 224)",
        url: "color: rgb(206, 145, 120)",
        variable: "color: rgb(188, 63, 60)",
      },
    },
  };

  if (!block || !block.type) {
    return <div className="text-red-500 p-2">Erro: Bloco inválido</div>;
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative lexical-block-editor" data-block-id={block.id} style={{ width: '100%' }}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable 
              className="min-h-[50px] outline-none resize-none" 
              style={{ 
                paddingLeft: '0',
                paddingRight: '32px',
                paddingTop: '8px',
                paddingBottom: '8px',
                color: "#37352F", 
                fontSize: "16px",
                lineHeight: "1.5",
                width: '100%',
                margin: '0'
              }} 
            />
          }
          placeholder={
            <div className="absolute top-2 left-0 pointer-events-none text-gray-400 text-sm" style={{ paddingLeft: '0' }}>
              Digite / para comandos...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin />
        <TabIndentationPlugin />
        <QuoteEnterPlugin />
        <HorizontalRuleTransformPlugin />
        <FloatingToolbarPlugin />
        <SlashCommandPlugin />
        <BackspaceDeletePlugin isFirstBlock={isFirstBlock} />
        <EnterToNewBlockPlugin onCreateBlockBelow={onCreateBlockBelow} />
        <EditorStateListener block={block} onUpdate={onUpdate} />
        <EmptyCheckProvider onCheckEmpty={onCheckEmpty} />
        <CancelCitacaoBranhamProvider onCancel={onCancelCitacaoBranham} />
        <SaveCitacaoBranhamProvider onSave={onSaveCitacaoBranham} />
        <TransformBlockProvider onTransformBlock={onTransformBlock} />
        <AddBlockProvider onAddBlock={onAddBlock} />
        {(() => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalBlockEditor.tsx:render',message:'Rendering TranslationQuoteTransformPlugin',data:{blockType:block.type,hasOnTransformBlock:!!onTransformBlock},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          return <TranslationQuoteTransformPlugin onTransformBlock={onTransformBlock} blockType={block.type} />;
        })()}
      </div>
    </LexicalComposer>
  );
}

