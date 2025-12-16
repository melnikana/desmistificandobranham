"use client";

import React from 'react';
import type { PostBlock } from '@/lib/blocks/types';
import BlockWrapper from './BlockWrapper';
import LexicalBlockEditor from './LexicalBlockEditor';
import NonLexicalBlock from './NonLexicalBlock';

interface ColumnsBlockProps {
  block: PostBlock;
  onUpdate: (payload: any) => void;
  onAddBlock?: (type: any, position: number, parentBlockId?: string, column?: 'left' | 'right') => void;
}

/**
 * Renderiza bloco columns-2 com blocos filhos
 */
export default function ColumnsBlock({ block, onUpdate, onAddBlock }: ColumnsBlockProps) {
  const payload = block.payload as any;
  const leftBlocks = (payload.left || []) as PostBlock[];
  const rightBlocks = (payload.right || []) as PostBlock[];

  const isLexicalBlock = (type: string): boolean => {
    return ['text', 'heading', 'bullet_list', 'numbered_list', 'quote', 'code_block'].includes(type);
  };

  const renderBlockContent = (childBlock: PostBlock) => {
    if (isLexicalBlock(childBlock.type)) {
      return (
        <LexicalBlockEditor
          block={childBlock}
          onUpdate={(payload) => {
            // Atualizar bloco filho dentro do payload do container
            const updatedLeft = leftBlocks.map(b => b.id === childBlock.id ? { ...b, payload } : b);
            const updatedRight = rightBlocks.map(b => b.id === childBlock.id ? { ...b, payload } : b);
            onUpdate({ left: updatedLeft, right: updatedRight });
          }}
        />
      );
    }
    return <NonLexicalBlock block={childBlock} />;
  };

  return (
    <div className="block-columns-2 grid grid-cols-2 gap-4">
      <div className="block-column-left space-y-1">
        {leftBlocks.map((childBlock, index) => (
          <BlockWrapper
            key={childBlock.id}
            block={childBlock}
            index={index}
            totalBlocks={leftBlocks.length}
            onAddBlock={(type, pos) => {
              if (onAddBlock) {
                onAddBlock(type, pos, block.id, 'left');
              }
            }}
            onUpdateBlock={(blockId, payload) => {
              const updated = leftBlocks.map(b => b.id === blockId ? { ...b, payload } : b);
              onUpdate({ left: updated, right: rightBlocks });
            }}
            onDeleteBlock={(blockId) => {
              const updated = leftBlocks.filter(b => b.id !== blockId);
              onUpdate({ left: updated, right: rightBlocks });
            }}
            onMoveBlock={(blockId, direction) => {
              const currentIndex = leftBlocks.findIndex(b => b.id === blockId);
              if (currentIndex === -1) return;
              const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
              if (newIndex < 0 || newIndex >= leftBlocks.length) return;
              const updated = [...leftBlocks];
              const [moved] = updated.splice(currentIndex, 1);
              updated.splice(newIndex, 0, moved);
              onUpdate({ left: updated, right: rightBlocks });
            }}
          >
            {renderBlockContent(childBlock)}
          </BlockWrapper>
        ))}
      </div>
      <div className="block-column-right space-y-1">
        {rightBlocks.map((childBlock, index) => (
          <BlockWrapper
            key={childBlock.id}
            block={childBlock}
            index={index}
            totalBlocks={rightBlocks.length}
            onAddBlock={(type, pos) => {
              if (onAddBlock) {
                onAddBlock(type, pos, block.id, 'right');
              }
            }}
            onUpdateBlock={(blockId, payload) => {
              const updated = rightBlocks.map(b => b.id === blockId ? { ...b, payload } : b);
              onUpdate({ left: leftBlocks, right: updated });
            }}
            onDeleteBlock={(blockId) => {
              const updated = rightBlocks.filter(b => b.id !== blockId);
              onUpdate({ left: leftBlocks, right: updated });
            }}
            onMoveBlock={(blockId, direction) => {
              const currentIndex = rightBlocks.findIndex(b => b.id === blockId);
              if (currentIndex === -1) return;
              const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
              if (newIndex < 0 || newIndex >= rightBlocks.length) return;
              const updated = [...rightBlocks];
              const [moved] = updated.splice(currentIndex, 1);
              updated.splice(newIndex, 0, moved);
              onUpdate({ left: leftBlocks, right: updated });
            }}
          >
            {renderBlockContent(childBlock)}
          </BlockWrapper>
        ))}
      </div>
    </div>
  );
}


