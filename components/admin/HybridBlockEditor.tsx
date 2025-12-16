"use client";

import React, { useState, useCallback, useRef } from 'react';
import type { PostBlock, BlockType } from '@/lib/blocks/types';
import BlockWrapper from './blocks/BlockWrapper';
import LexicalBlockEditor from './blocks/LexicalBlockEditor';
import NonLexicalBlock from './blocks/NonLexicalBlock';
import ColumnsBlock from './blocks/ColumnsBlock';
import CollapsibleBlock from './blocks/CollapsibleBlock';
import { sanitizeBlockPayload } from '@/lib/blocks/validators';

interface HybridBlockEditorProps {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
  postId?: string;
}

/**
 * Editor híbrido onde blocos são a fonte da verdade
 * Blocos textuais usam Lexical apenas para renderização
 * Blocos não-textuais são HTML simples
 */
export default function HybridBlockEditor({
  blocks,
  onChange,
  postId,
}: HybridBlockEditorProps) {
  const [localBlocks, setLocalBlocks] = useState<PostBlock[]>(blocks);
  const isInternalUpdateRef = React.useRef(false);

  // Sincronizar quando blocks prop mudar (apenas se vier de fora, não de mudanças internas)
  React.useEffect(() => {
    // Se a mudança foi interna, não sincronizar
    if (isInternalUpdateRef.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:useEffect:blocks',message:'Blocks prop changed but ignoring (internal update)',data:{blocksCount:blocks.length,localBlocksCount:localBlocks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      isInternalUpdateRef.current = false;
      return;
    }
    
    // Comparar por IDs para verificar se realmente mudou
    const blocksChanged = blocks.length !== localBlocks.length || 
      blocks.some((b, i) => b.id !== localBlocks[i]?.id);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:useEffect:blocks',message:'Blocks prop changed from outside, syncing',data:{blocksCount:blocks.length,localBlocksCount:localBlocks.length,blocksChanged,blocksIds:blocks.map(b=>b.id),localBlocksIds:localBlocks.map(b=>b.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    if (blocksChanged) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:useEffect:blocks',message:'Updating localBlocks from props',data:{blocksCount:blocks.length,localBlocksCount:localBlocks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      setLocalBlocks(blocks);
    }
  }, [blocks]);

  // Verificar se bloco é textual (usa Lexical)
  const isLexicalBlock = (type: BlockType): boolean => {
    return ['text', 'heading', 'bullet_list', 'numbered_list', 'quote', 'code_block', 'citacao_branham'].includes(type);
  };

  // Criar payload padrão para novo bloco
  const getDefaultPayload = (type: BlockType): any => {
    // Função helper para criar estado Lexical baseado no tipo
    const createLexicalState = (nodeType: string, nodeProps: any = {}) => {
      const baseRoot = {
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1
      };

      let firstChild: any;

      switch (nodeType) {
        case 'heading': {
          const level = nodeProps.level || 1;
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
        case 'code': {
          firstChild = {
            children: [],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "code",
            language: nodeProps.language || 'plaintext',
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
        case 'translation-quote': {
          firstChild = {
            text: nodeProps.text || "",
            html: nodeProps.html || "",
            editorState: nodeProps.editorState || "",
            source: nodeProps.source || "recordings",
            isSaved: false,
            type: "translation-quote",
            version: 1
          };
          break;
        }
        default: // paragraph
          firstChild = {
            children: [],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1
          };
      }

      return {
        root: {
          ...baseRoot,
          children: [firstChild]
        }
      };
    };

    const defaultPayloads: Record<BlockType, any> = {
      // Blocos Lexical
      text: { lexicalState: createLexicalState('paragraph'), text: '', html: '' },
      heading: { level: 1, lexicalState: createLexicalState('heading', { level: 1 }), text: '', html: '' },
      bullet_list: { lexicalState: createLexicalState('bullet_list'), text: '', html: '' },
      numbered_list: { lexicalState: createLexicalState('numbered_list'), text: '', html: '' },
      quote: { lexicalState: createLexicalState('quote'), text: '', html: '' },
      code_block: { lexicalState: createLexicalState('code', { language: 'plaintext' }), language: 'plaintext', text: '', html: '' },
      // Blocos Não-Lexical
      separator: { style: 'solid' },
      image: { url: '', alt: '', caption: '' },
      gif: { url: '', alt: '' },
      youtube_video: { videoId: '', url: '' },
      table: { rows: [{ cells: [{ content: '' }] }], columns: 2, headers: false },
      // Blocos Container
      'columns-2': { left: [], right: [] },
      collapsible_container: { title: '', children: [], collapsed: false },
      // Bloco Customizado (usa Lexical com TranslationQuoteNode)
      citacao_branham: { 
        lexicalState: createLexicalState('translation-quote', { source: 'recordings' }),
        text: '',
        html: '',
        source: 'recordings'
      },
    };
    return defaultPayloads[type] || {};
  };

  const handleAddBlock = useCallback(
    (type: BlockType, position: number) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleAddBlock',message:'Adding new block',data:{type,position,currentBlocksCount:localBlocks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const newPosition = Math.min(position, localBlocks.length);
      
      const defaultPayload = getDefaultPayload(type);
      const sanitizedPayload = sanitizeBlockPayload(type, defaultPayload);

      const newBlock: Omit<PostBlock, 'id' | 'created_at' | 'updated_at'> = {
        post_id: postId || '',
        type,
        position: newPosition,
        payload: sanitizedPayload,
      };

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const blockWithId: PostBlock = {
        ...newBlock,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Ajustar posições dos blocos existentes
      const updatedBlocks = [...localBlocks];
      updatedBlocks.forEach((block) => {
        if (block.position >= newPosition) {
          block.position = block.position + 1;
        }
      });
      updatedBlocks.splice(newPosition, 0, blockWithId);

      // Se for citacao_branham, criar automaticamente um bloco de parágrafo abaixo
      if (type === 'citacao_branham') {
        const textBlockPosition = newPosition + 1;
        const defaultTextPayload = getDefaultPayload('text');
        const sanitizedTextPayload = sanitizeBlockPayload('text', defaultTextPayload);
        
        const newTextBlock: PostBlock = {
          id: `temp-${Date.now()}-${Math.random()}`,
          post_id: postId || '',
          type: 'text',
          position: textBlockPosition,
          payload: sanitizedTextPayload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Ajustar posições dos blocos existentes novamente
        updatedBlocks.forEach((block) => {
          if (block.position >= textBlockPosition) {
            block.position = block.position + 1;
          }
        });
        
        // Inserir o novo bloco de texto
        updatedBlocks.splice(textBlockPosition, 0, newTextBlock);
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleAddBlock',message:'Block added, updating state',data:{newBlockId:tempId,newPosition,updatedBlocksCount:updatedBlocks.length,type,createdTextBlockBelow:type === 'citacao_branham'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleAddBlock',message:'State updated, scheduling focus',data:{newBlockId:tempId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Focar no novo bloco após um delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        const newBlockElement = document.querySelector(`[data-block-id="${tempId}"]`);
        if (newBlockElement) {
          const contentEditable = newBlockElement.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentEditable) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleAddBlock',message:'Focusing on new block',data:{newBlockId:tempId,found:!!contentEditable},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            contentEditable.focus();
          } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleAddBlock',message:'ContentEditable not found in new block',data:{newBlockId:tempId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
          }
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleAddBlock',message:'New block element not found in DOM',data:{newBlockId:tempId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }
      }, 100);
    },
    [localBlocks, postId, onChange]
  );

  const handleUpdateBlock = useCallback(
    (blockId: string, payload: any) => {
      const updatedBlocks = localBlocks.map((block) => {
        if (block.id === blockId) {
          return { ...block, payload, updated_at: new Date().toISOString() };
        }
        return block;
      });

      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
    },
    [localBlocks, onChange]
  );

  // Função para focar no bloco anterior após deleção
  const focusPreviousBlock = useCallback((deletedBlockId: string, updatedBlocks: PostBlock[]) => {
    const deletedIndex = updatedBlocks.findIndex(b => b.id === deletedBlockId);
    // Se o bloco ainda existe no array, significa que não foi deletado ainda
    // Nesse caso, usar o índice antes da deleção
    let previousBlock: PostBlock | null = null;
    
    if (deletedIndex > 0) {
      // Bloco ainda está no array, pegar o anterior
      previousBlock = updatedBlocks[deletedIndex - 1];
    } else {
      // Bloco foi removido, encontrar pelo índice original
      const originalIndex = localBlocks.findIndex(b => b.id === deletedBlockId);
      if (originalIndex > 0 && originalIndex - 1 < updatedBlocks.length) {
        previousBlock = updatedBlocks[originalIndex - 1];
      }
    }
    
    if (!previousBlock) {
      console.log('[focusPreviousBlock] No previous block found');
      return;
    }
    
    console.log('[focusPreviousBlock] Focusing on previous block:', previousBlock.id);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const previousElement = document.querySelector(`[data-block-id="${previousBlock!.id}"]`) as HTMLElement;
        if (previousElement) {
          const contentEditable = previousElement.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentEditable) {
            contentEditable.focus();
            // Mover cursor para o final
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(contentEditable);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
            console.log('[focusPreviousBlock] Focused on previous block');
          } else {
            console.log('[focusPreviousBlock] ContentEditable not found');
          }
        } else {
          console.log('[focusPreviousBlock] Previous element not found in DOM');
        }
      });
    });
  }, [localBlocks]);

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      // Proteção: nunca deletar o primeiro bloco
      const blockIndex = localBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === 0) {
        console.log('[HybridBlockEditor] Cannot delete first block');
        return;
      }
      
      console.log('[HybridBlockEditor] handleDeleteBlock called:', blockId);
      console.log('[HybridBlockEditor] Current blocks:', localBlocks.map(b => b.id));
      
      const updatedBlocks = localBlocks
        .filter((block) => block.id !== blockId)
        .map((block, idx) => ({ ...block, position: idx }));

      console.log('[HybridBlockEditor] Updated blocks:', updatedBlocks.map(b => b.id));
      console.log('[HybridBlockEditor] Block was deleted:', updatedBlocks.length < localBlocks.length);

      // Marcar como atualização interna antes de chamar onChange
      isInternalUpdateRef.current = true;
      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
      
      // Focar no bloco anterior usando o array atualizado
      focusPreviousBlock(blockId, updatedBlocks);
    },
    [localBlocks, onChange, focusPreviousBlock]
  );

  const handleTransformBlock = useCallback(
    (blockId: string, newType: BlockType) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleTransformBlock',message:'handleTransformBlock called',data:{blockId,newType},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      const block = localBlocks.find(b => b.id === blockId);
      if (!block || !isLexicalBlock(block.type)) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleTransformBlock',message:'Block not found or not Lexical',data:{blockId,blockType:block?.type,found:!!block},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return; // Só pode transformar blocos Lexical
      }

      // Verificar se o novo tipo também é Lexical
      if (!isLexicalBlock(newType)) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleTransformBlock',message:'New type is not Lexical',data:{newType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return; // Não pode transformar para tipo não-Lexical
      }

      const currentPayload = block.payload as any;
      const defaultPayload = getDefaultPayload(newType);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleTransformBlock',message:'Got default payload',data:{newType,hasLexicalState:!!defaultPayload.lexicalState,lexicalStateRoot:defaultPayload.lexicalState?.root},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Preservar conteúdo do bloco atual
      let newPayload: any;
      
      if (newType === 'heading') {
        // Para heading, manter o nível se já for heading, senão usar nível 1
        const level = block.type === 'heading' ? (currentPayload.level || 1) : 1;
        newPayload = {
          ...defaultPayload,
          level: level,
          lexicalState: currentPayload.lexicalState || defaultPayload.lexicalState,
          text: currentPayload.text || '',
          html: currentPayload.html || '',
        };
      } else if (newType === 'citacao_branham') {
        // Para citacao_branham, sempre usar estado inicial com isSaved: false (modo edição)
        newPayload = {
          ...defaultPayload,
          // Não preservar lexicalState anterior - sempre começar em modo de edição
          text: '',
          html: '',
        };
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleTransformBlock',message:'Creating citacao_branham payload',data:{newPayloadLexicalState:newPayload.lexicalState?.root?.children?.[0]?.isSaved,hasLexicalState:!!newPayload.lexicalState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      } else {
        // Para outros tipos, preservar lexicalState, text e html
        newPayload = {
          ...defaultPayload,
          lexicalState: currentPayload.lexicalState || defaultPayload.lexicalState,
          text: currentPayload.text || '',
          html: currentPayload.html || '',
        };
      }

      const sanitizedPayload = sanitizeBlockPayload(newType, newPayload);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleTransformBlock',message:'After sanitizeBlockPayload',data:{newType,sanitizedLexicalState:sanitizedPayload.lexicalState?.root?.children?.[0]?.isSaved,hasLexicalState:!!sanitizedPayload.lexicalState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      const blockIndex = localBlocks.findIndex(b => b.id === blockId);
      let updatedBlocks = localBlocks.map((b) => {
        if (b.id === blockId) {
          return {
            ...b,
            type: newType,
            payload: sanitizedPayload,
            updated_at: new Date().toISOString(),
          };
        }
        return b;
      });

      // Se transformando para citacao_branham, criar bloco de parágrafo abaixo
      if (newType === 'citacao_branham') {
        const newPosition = blockIndex + 1;
        
        // Criar novo bloco de texto abaixo
        const defaultTextPayload = getDefaultPayload('text');
        const sanitizedTextPayload = sanitizeBlockPayload('text', defaultTextPayload);
        
        const newTextBlock: PostBlock = {
          id: `temp-${Date.now()}-${Math.random()}`,
          post_id: postId || '',
          type: 'text',
          position: newPosition,
          payload: sanitizedTextPayload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Ajustar posições dos blocos existentes
        updatedBlocks = updatedBlocks.map((b) => {
          if (b.position >= newPosition) {
            return { ...b, position: b.position + 1 };
          }
          return b;
        });
        
        // Inserir o novo bloco
        updatedBlocks.splice(newPosition, 0, newTextBlock);
      }

      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
    },
    [localBlocks, onChange, getDefaultPayload, postId]
  );

  const handleCancelCitacaoBranham = useCallback(
    (blockId: string) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'handleCancelCitacaoBranham called',data:{blockId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      const blockIndex = localBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'Block not found',data:{blockId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return;
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'Block found',data:{blockId,blockIndex,totalBlocks:localBlocks.length,nextBlockExists:!!localBlocks[blockIndex+1]},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Encontrar o bloco abaixo (criado na inserção) ANTES de deletar
      const nextBlock = localBlocks[blockIndex + 1];
      const nextBlockId = nextBlock?.id;
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'Deleting block',data:{blockId,nextBlockId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Deletar o bloco atual
      const updatedBlocks = localBlocks
        .filter((block) => block.id !== blockId)
        .map((block, idx) => ({ ...block, position: idx }));

      isInternalUpdateRef.current = true;
      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'Block deleted, focusing',data:{nextBlockId,hasNextBlock:!!nextBlockId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Se houver bloco abaixo, focar nele após deleção
      if (nextBlockId) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              const nextBlockElement = document.querySelector(`[data-block-id="${nextBlockId}"]`) as HTMLElement;
              if (nextBlockElement) {
                const contentEditable = nextBlockElement.querySelector('[contenteditable="true"]') as HTMLElement;
                if (contentEditable) {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'Focusing on next block',data:{nextBlockId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
                  // #endregion
                  contentEditable.focus();
                  const range = document.createRange();
                  const selection = window.getSelection();
                  range.selectNodeContents(contentEditable);
                  range.collapse(true);
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                } else {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'ContentEditable not found',data:{nextBlockId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
                  // #endregion
                }
              } else {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'Next block element not found',data:{nextBlockId},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
              }
            }, 150);
          });
        });
      } else {
        // Se não houver bloco abaixo, focar no bloco anterior
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:handleCancelCitacaoBranham',message:'No next block, focusing previous',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        focusPreviousBlock(blockId, updatedBlocks);
      }
    },
    [localBlocks, onChange, focusPreviousBlock]
  );

  const handleSaveCitacaoBranham = useCallback(
    (blockId: string) => {
      const blockIndex = localBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return;
      
      // Criar novo bloco de parágrafo abaixo do bloco atual
      const newPosition = blockIndex + 1;
      
      // Criar ID temporário para o novo bloco antes de adicionar
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      
      const defaultPayload = getDefaultPayload('text');
      const sanitizedPayload = sanitizeBlockPayload('text', defaultPayload);

      const newBlock: Omit<PostBlock, 'id' | 'created_at' | 'updated_at'> = {
        post_id: postId || '',
        type: 'text',
        position: newPosition,
        payload: sanitizedPayload,
      };

      const blockWithId: PostBlock = {
        ...newBlock,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Ajustar posições dos blocos existentes
      const updatedBlocks = [...localBlocks];
      updatedBlocks.forEach((block) => {
        if (block.position >= newPosition) {
          block.position = block.position + 1;
        }
      });
      updatedBlocks.splice(newPosition, 0, blockWithId);

      isInternalUpdateRef.current = true;
      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
      
      // Focar no novo parágrafo após criação
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const newBlockElement = document.querySelector(`[data-block-id="${tempId}"]`) as HTMLElement;
            if (newBlockElement) {
              const contentEditable = newBlockElement.querySelector('[contenteditable="true"]') as HTMLElement;
              if (contentEditable) {
                contentEditable.focus();
                // Mover cursor para o início do novo parágrafo
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(contentEditable);
                range.collapse(true); // true = início
                selection?.removeAllRanges();
                selection?.addRange(range);
              }
            }
          }, 150);
        });
      });
    },
    [localBlocks, onChange, postId, getDefaultPayload]
  );

  const handleMoveBlock = useCallback(
    (blockId: string, direction: 'up' | 'down') => {
      const currentIndex = localBlocks.findIndex((b) => b.id === blockId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= localBlocks.length) return;

      const updatedBlocks = [...localBlocks];
      const [movedBlock] = updatedBlocks.splice(currentIndex, 1);
      updatedBlocks.splice(newIndex, 0, movedBlock);
      updatedBlocks.forEach((block, idx) => {
        block.position = idx;
      });

      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
    },
    [localBlocks, onChange]
  );

  const handleAddBlockInContainer = useCallback(
    (type: BlockType, position: number, parentBlockId?: string, column?: 'left' | 'right') => {
      if (!parentBlockId) {
        handleAddBlock(type, position);
        return;
      }

      // Adicionar bloco dentro de um container
      const parentBlock = localBlocks.find(b => b.id === parentBlockId);
      if (!parentBlock) return;

      const defaultPayload = getDefaultPayload(type);
      const sanitizedPayload = sanitizeBlockPayload(type, defaultPayload);

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const newChildBlock: PostBlock = {
        id: tempId,
        post_id: postId || '',
        type,
        position,
        payload: sanitizedPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (parentBlock.type === 'columns-2') {
        const payload = parentBlock.payload as any;
        const left = payload.left || [];
        const right = payload.right || [];

        if (column === 'left') {
          const updated = [...left];
          updated.splice(position, 0, newChildBlock);
          handleUpdateBlock(parentBlockId, { left: updated, right });
        } else {
          const updated = [...right];
          updated.splice(position, 0, newChildBlock);
          handleUpdateBlock(parentBlockId, { left, right: updated });
        }
      } else if (parentBlock.type === 'collapsible_container') {
        const payload = parentBlock.payload as any;
        const children = payload.children || [];
        const updated = [...children];
        updated.splice(position, 0, newChildBlock);
        handleUpdateBlock(parentBlockId, { ...payload, children: updated });
      }
    },
    [localBlocks, postId, handleAddBlock, handleUpdateBlock]
  );

  // Refs para armazenar funções checkIfEmpty de cada bloco Lexical
  const checkEmptyRefs = useRef<Map<string, () => boolean>>(new Map());

  const renderBlockContent = (block: PostBlock) => {
    if (!block || !block.type) {
      return <div className="text-red-500">Erro: Bloco inválido</div>;
    }

    // Blocos container
    if (block.type === 'columns-2') {
      return (
        <ColumnsBlock
          block={block}
          onUpdate={(payload) => handleUpdateBlock(block.id, payload)}
          onAddBlock={handleAddBlockInContainer}
        />
      );
    }

    if (block.type === 'collapsible_container') {
      return (
        <CollapsibleBlock
          block={block}
          onUpdate={(payload) => handleUpdateBlock(block.id, payload)}
          onAddBlock={handleAddBlockInContainer}
        />
      );
    }

    // Blocos textuais (usam Lexical)
    if (isLexicalBlock(block.type)) {
      const blockIndex = localBlocks.findIndex(b => b.id === block.id);
      const isFirstBlock = blockIndex === 0;
      
      return (
        <LexicalBlockEditor
          block={block}
          onUpdate={(payload) => handleUpdateBlock(block.id, payload)}
          onDeleteBlock={() => {
            // Não permitir deletar o primeiro bloco
            if (!isFirstBlock) {
              handleDeleteBlock(block.id);
            }
          }}
          onFocusPrevious={() => {
            // Esta função não é mais necessária, pois o foco é feito dentro de handleDeleteBlock
            // Mas mantemos para compatibilidade
          }}
          onCreateBlockBelow={() => {
            // Criar novo bloco de texto abaixo do atual
            handleAddBlock('text', blockIndex + 1);
          }}
          onCheckEmpty={(checkFn) => {
            checkEmptyRefs.current.set(block.id, checkFn);
          }}
          onCancelCitacaoBranham={block.type === 'citacao_branham' ? () => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:renderBlockContent',message:'onCancelCitacaoBranham callback created',data:{blockId:block.id,blockType:block.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            handleCancelCitacaoBranham(block.id);
          } : undefined}
          onSaveCitacaoBranham={block.type === 'citacao_branham' ? () => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:renderBlockContent',message:'onSaveCitacaoBranham callback created',data:{blockId:block.id,blockType:block.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            handleSaveCitacaoBranham(block.id);
          } : undefined}
          onTransformBlock={(newType) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:renderBlockContent',message:'onTransformBlock callback called',data:{blockId:block.id,blockType:block.type,newType},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            handleTransformBlock(block.id, newType as BlockType);
          }}
          onAddBlock={(type, position) => {
            handleAddBlock(type as BlockType, position);
          }}
          isFirstBlock={isFirstBlock}
        />
      );
    }

    // Blocos não-textuais (HTML simples)
    return <NonLexicalBlock block={block} />;
  };

  // Criar bloco inicial vazio se não houver blocos
  React.useEffect(() => {
    if (localBlocks.length === 0) {

      const defaultPayload = getDefaultPayload('text');
      const sanitizedPayload = sanitizeBlockPayload('text', defaultPayload);
      
      const initialBlock: PostBlock = {
        id: `temp-initial-${Date.now()}`,
        post_id: postId || '',
        type: 'text',
        position: 0,
        payload: sanitizedPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:252',message:'Initial block created',data:{blockId:initialBlock.id,blockType:initialBlock.type,hasPayload:!!initialBlock.payload,payloadKeys:Object.keys(initialBlock.payload || {})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      setLocalBlocks([initialBlock]);
      onChange([initialBlock]);
    }
  }, []); // Apenas na montagem inicial

  return (
    <div className="hybrid-block-editor" style={{ position: 'relative' }}>
      {localBlocks.map((block, index) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HybridBlockEditor.tsx:render',message:'Rendering block',data:{blockId:block.id,blockType:block.type,index,totalBlocks:localBlocks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        const isLexical = isLexicalBlock(block.type);
        const checkEmptyFn = checkEmptyRefs.current.get(block.id);
        
        return (
        <BlockWrapper
          key={block.id}
          block={block}
          index={index}
          totalBlocks={localBlocks.length}
          onAddBlock={handleAddBlock}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onMoveBlock={handleMoveBlock}
          onTransformBlock={handleTransformBlock}
          isLexicalBlock={isLexical}
          onCheckEmpty={checkEmptyFn || undefined}
        >
          {renderBlockContent(block)}
        </BlockWrapper>
        );
      })}
    </div>
  );
}

