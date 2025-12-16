"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PostBlock } from '@/lib/blocks/types';
import BlockWrapper from './BlockWrapper';
import LexicalBlockEditor from './LexicalBlockEditor';
import NonLexicalBlock from './NonLexicalBlock';

interface CollapsibleBlockProps {
  block: PostBlock;
  onUpdate: (payload: any) => void;
  onAddBlock?: (type: any, position: number, parentBlockId?: string) => void;
}

/**
 * Renderiza bloco collapsible_container com blocos filhos
 */
export default function CollapsibleBlock({ block, onUpdate, onAddBlock }: CollapsibleBlockProps) {
  const payload = block.payload as any;
  const [collapsed, setCollapsed] = useState(payload.collapsed || false);
  const children = (payload.children || []) as PostBlock[];
  const title = payload.title || '';

  const isLexicalBlock = (type: string): boolean => {
    return ['text', 'heading', 'bullet_list', 'numbered_list', 'quote', 'code_block'].includes(type);
  };

  const renderBlockContent = (childBlock: PostBlock) => {
    if (isLexicalBlock(childBlock.type)) {
      return (
        <LexicalBlockEditor
          block={childBlock}
          onUpdate={(payload) => {
            const updated = children.map(b => b.id === childBlock.id ? { ...b, payload } : b);
            onUpdate({ title, children: updated, collapsed });
          }}
        />
      );
    }
    return <NonLexicalBlock block={childBlock} />;
  };

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onUpdate({ title, children, collapsed: newCollapsed });
  };

  return (
    <div className="block-collapsible border rounded-lg">
      <div className="block-collapsible-header p-3 bg-gray-50 border-b font-medium flex items-center justify-between">
        <span>{title || 'Seção Recolhível'}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      {!collapsed && (
        <div className="block-collapsible-content p-4 space-y-1">
          {children.map((childBlock, index) => (
            <BlockWrapper
              key={childBlock.id}
              block={childBlock}
              index={index}
              totalBlocks={children.length}
              onAddBlock={(type, pos) => {
                if (onAddBlock) {
                  onAddBlock(type, pos, block.id);
                }
              }}
              onUpdateBlock={(blockId, payload) => {
                const updated = children.map(b => b.id === blockId ? { ...b, payload } : b);
                onUpdate({ title, children: updated, collapsed });
              }}
              onDeleteBlock={(blockId) => {
                const updated = children.filter(b => b.id !== blockId);
                onUpdate({ title, children: updated, collapsed });
              }}
              onMoveBlock={(blockId, direction) => {
                const currentIndex = children.findIndex(b => b.id === blockId);
                if (currentIndex === -1) return;
                const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
                if (newIndex < 0 || newIndex >= children.length) return;
                const updated = [...children];
                const [moved] = updated.splice(currentIndex, 1);
                updated.splice(newIndex, 0, moved);
                onUpdate({ title, children: updated, collapsed });
              }}
            >
              {renderBlockContent(childBlock)}
            </BlockWrapper>
          ))}
        </div>
      )}
    </div>
  );
}


