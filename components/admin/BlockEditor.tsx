"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PostBlock, BlockType, CreateBlockData } from '@/lib/blocks/types';
import BlockRenderer from './blocks/BlockRenderer';
import TextBlockEditor from './blocks/TextBlockEditor';
import HeadingBlockEditor from './blocks/HeadingBlockEditor';
import BulletListBlockEditor from './blocks/BulletListBlockEditor';
import NumberedListBlockEditor from './blocks/NumberedListBlockEditor';
import QuoteBlockEditor from './blocks/QuoteBlockEditor';
import CodeBlockEditor from './blocks/CodeBlockEditor';
import ImageBlockEditor from './blocks/ImageBlockEditor';
import SeparatorBlockEditor from './blocks/SeparatorBlockEditor';
import GifBlockEditor from './blocks/GifBlockEditor';
import YouTubeBlockEditor from './blocks/YouTubeBlockEditor';
import TableBlockEditor from './blocks/TableBlockEditor';
import ColumnsBlockEditor from './blocks/ColumnsBlockEditor';
import CollapsibleBlockEditor from './blocks/CollapsibleBlockEditor';
import CitacaoBranhamBlockEditor from './blocks/CitacaoBranhamBlockEditor';

interface BlockEditorProps {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
  postId?: string;
  onSaveBlock?: (block: PostBlock) => Promise<void>;
  onDeleteBlock?: (blockId: string) => Promise<void>;
  onReorderBlocks?: (blockIds: string[]) => Promise<void>;
}

/**
 * Editor principal que gerencia uma lista de blocos
 * Lexical é usado apenas para editar blocos específicos (rich_text, heading, etc)
 */
export default function BlockEditor({
  blocks,
  onChange,
  postId,
  onSaveBlock,
  onDeleteBlock,
  onReorderBlocks,
}: BlockEditorProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [localBlocks, setLocalBlocks] = useState<PostBlock[]>(blocks);

  // Sincronizar quando blocks prop mudar
  React.useEffect(() => {
    setLocalBlocks(blocks);
  }, [blocks]);

  const handleAddBlock = useCallback(
    async (type: BlockType, position?: number) => {
      const newPosition = position !== undefined ? position : localBlocks.length;

      const defaultPayloads: Record<BlockType, any> = {
        // Blocos Lexical
        text: { lexicalState: null, text: '', html: '' },
        heading: { level: 1, lexicalState: null, text: '', html: '' },
        bullet_list: { lexicalState: null, text: '', html: '' },
        numbered_list: { lexicalState: null, text: '', html: '' },
        quote: { lexicalState: null, text: '', html: '' },
        code_block: { lexicalState: null, language: 'plaintext', text: '', html: '' },
        // Blocos Não-Lexical
        separator: { style: 'solid' },
        image: { url: '', alt: '', caption: '' },
        gif: { url: '', alt: '' },
        youtube_video: { videoId: '', url: '' },
        table: { rows: [{ cells: [{ content: '' }] }], columns: 2, headers: false },
        // Blocos Container
        'columns-2': { children: [] },
        collapsible_container: { title: '', children: [], collapsed: false },
        // Bloco Customizado
        citacao_branham: { text: '', source: '' },
      };

      const newBlock: Omit<PostBlock, 'id' | 'created_at' | 'updated_at'> = {
        post_id: postId || '',
        type,
        position: newPosition,
        payload: defaultPayloads[type],
      };

      // Criar bloco localmente primeiro
      const tempId = `temp-${Date.now()}`;
      const blockWithId: PostBlock = {
        ...newBlock,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedBlocks = [...localBlocks];
      // Ajustar posições dos blocos existentes se necessário
      updatedBlocks.forEach((block) => {
        if (block.position >= newPosition) {
          block.position = block.position + 1;
        }
      });
      updatedBlocks.splice(newPosition, 0, blockWithId);

      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
      setEditingBlockId(tempId);

      // Se temos API, salvar via API
      if (postId) {
        try {
          const token = await getAuthToken();
          const response = await fetch(`/api/posts/${postId}/blocks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type,
              position: newPosition,
              payload: defaultPayloads[type],
            }),
          });

          if (response.ok) {
            const { data } = await response.json();
            // Atualizar com ID real do servidor
            const finalBlocks = updatedBlocks.map((block) =>
              block.id === tempId ? data : block
            );
            setLocalBlocks(finalBlocks);
            onChange(finalBlocks);
            setEditingBlockId(data.id);
          }
        } catch (error) {
          console.error('Error creating block via API:', error);
          // Manter bloco local mesmo se API falhar
        }
      }
    },
    [localBlocks, postId, onChange, onSaveBlock]
  );

  const handleUpdateBlock = useCallback(
    async (blockId: string, payload: any) => {
      const updatedBlocks = localBlocks.map((block) => {
        if (block.id === blockId) {
          return { ...block, payload, updated_at: new Date().toISOString() };
        }
        return block;
      });

      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);

      // Salvar via API se disponível
      if (onSaveBlock && postId) {
        const block = updatedBlocks.find((b) => b.id === blockId);
        if (block) {
          try {
            await fetch(`/api/posts/${postId}/blocks/${blockId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await getAuthToken()}`,
              },
              body: JSON.stringify({
                payload: block.payload,
              }),
            });
          } catch (error) {
            console.error('Error updating block:', error);
          }
        }
      }
    },
    [localBlocks, onChange, postId, onSaveBlock]
  );

  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      if (onDeleteBlock && postId) {
        try {
          await fetch(`/api/posts/${postId}/blocks/${blockId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${await getAuthToken()}`,
            },
          });
        } catch (error) {
          console.error('Error deleting block:', error);
        }
      }

      const updatedBlocks = localBlocks
        .filter((block) => block.id !== blockId)
        .map((block, idx) => ({ ...block, position: idx }));

      setLocalBlocks(updatedBlocks);
      onChange(updatedBlocks);
    },
    [localBlocks, onChange, postId, onDeleteBlock]
  );

  const handleMoveBlock = useCallback(
    async (blockId: string, direction: 'up' | 'down') => {
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

      // Reordenar via API se disponível
      if (onReorderBlocks && postId) {
        const blockIds = updatedBlocks.map((b) => b.id);
        try {
          await fetch(`/api/posts/${postId}/blocks/reorder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${await getAuthToken()}`,
            },
            body: JSON.stringify({ blockIds }),
          });
        } catch (error) {
          console.error('Error reordering blocks:', error);
        }
      }
    },
    [localBlocks, onChange, postId, onReorderBlocks]
  );

  const renderBlockEditor = (block: PostBlock) => {
    const { type, payload } = block;

    switch (type) {
      // Blocos Lexical
      case 'text':
        return (
          <TextBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'heading':
        return (
          <HeadingBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'bullet_list':
        return (
          <BulletListBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'numbered_list':
        return (
          <NumberedListBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'quote':
        return (
          <QuoteBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'code_block':
        return (
          <CodeBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      // Blocos Não-Lexical
      case 'image':
        return (
          <ImageBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'separator':
        return (
          <SeparatorBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'gif':
        return (
          <GifBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'youtube_video':
        return (
          <YouTubeBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      case 'table':
        return (
          <TableBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      // Blocos Container
      case 'columns-2':
        return (
          <ColumnsBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
            postId={postId}
          />
        );

      case 'collapsible_container':
        return (
          <CollapsibleBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
            postId={postId}
          />
        );

      // Bloco Customizado
      case 'citacao_branham':
        return (
          <CitacaoBranhamBlockEditor
            initialPayload={payload as any}
            onChange={(newPayload) => handleUpdateBlock(block.id, newPayload)}
          />
        );

      default:
        return (
          <div className="p-4 border rounded">
            <p>Editor não implementado para tipo: {type}</p>
          </div>
        );
    }
  };

  return (
    <div className="block-editor space-y-4">
      {localBlocks.length === 0 && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
          <p>Nenhum bloco ainda. Clique no botão + para adicionar.</p>
        </div>
      )}

      {localBlocks.map((block, index) => (
        <div
          key={block.id}
          className="block-item group relative border rounded-lg p-4 hover:border-gray-400 transition-colors"
        >
          {/* Controles do bloco */}
          <div className="absolute left-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-12">
            <button
              type="button"
              onClick={() => handleMoveBlock(block.id, 'up')}
              disabled={index === 0}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
              title="Mover para cima"
            >
              <MoveUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleMoveBlock(block.id, 'down')}
              disabled={index === localBlocks.length - 1}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
              title="Mover para baixo"
            >
              <MoveDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteBlock(block.id)}
              className="p-1 hover:bg-red-200 rounded text-red-600"
              title="Deletar bloco"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Conteúdo do bloco */}
          {editingBlockId === block.id ? (
            <div>
              {renderBlockEditor(block)}
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingBlockId(null)}
                >
                  Concluir
                </Button>
              </div>
            </div>
          ) : (
            <div onClick={() => setEditingBlockId(block.id)} className="cursor-pointer">
              <BlockRenderer block={block} mode="view" />
            </div>
          )}
        </div>
      ))}

      {/* Botão para adicionar bloco */}
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Bloco
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64 max-h-[400px] overflow-y-auto">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Texto</div>
            <DropdownMenuItem onClick={() => handleAddBlock('text')}>
              Parágrafo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('heading')}>
              Título
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('bullet_list')}>
              Lista com Marcadores
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('numbered_list')}>
              Lista Numerada
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('quote')}>
              Citação
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('code_block')}>
              Código
            </DropdownMenuItem>
            
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">Mídia</div>
            <DropdownMenuItem onClick={() => handleAddBlock('image')}>
              Imagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('gif')}>
              GIF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('youtube_video')}>
              Vídeo YouTube
            </DropdownMenuItem>
            
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">Layout</div>
            <DropdownMenuItem onClick={() => handleAddBlock('separator')}>
              Separador
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('table')}>
              Tabela
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('columns-2')}>
              2 Colunas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddBlock('collapsible_container')}>
              Seção Recolhível
            </DropdownMenuItem>
            
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">Especial</div>
            <DropdownMenuItem onClick={() => handleAddBlock('citacao_branham')}>
              Citação Branham
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Helper para obter token de autenticação
async function getAuthToken(): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return session.access_token;
    }
    
    // Fallback para modo dev
    if (typeof window !== 'undefined') {
      const devAuth = localStorage.getItem('dev_auth_user');
      if (devAuth) {
        return 'dev-auth-token';
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error getting auth token:', error);
    return '';
  }
}

