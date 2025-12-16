"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BlockEditor from '@/components/admin/BlockEditor';
import type { CollapsibleContainerBlockPayload, PostBlock } from '@/lib/blocks/types';

interface CollapsibleBlockEditorProps {
  initialPayload?: CollapsibleContainerBlockPayload;
  onChange: (payload: CollapsibleContainerBlockPayload) => void;
  postId?: string;
}

/**
 * Editor de bloco collapsible_container (container de blocos - NÃO usa Lexical)
 */
export default function CollapsibleBlockEditor({
  initialPayload,
  onChange,
  postId,
}: CollapsibleBlockEditorProps) {
  const [title, setTitle] = useState(initialPayload?.title || '');
  const [collapsed, setCollapsed] = useState(initialPayload?.collapsed || false);
  const children = (initialPayload?.children || []) as PostBlock[];

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onChange({
      title: newTitle,
      children,
      collapsed,
    });
  };

  const handleChildrenChange = (newChildren: PostBlock[]) => {
    onChange({
      title,
      children: newChildren,
      collapsed,
    });
  };

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onChange({
      title,
      children,
      collapsed: newCollapsed,
    });
  };

  return (
    <div className="collapsible-block-editor space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="collapsible-title">Título da Seção</Label>
          <Input
            id="collapsible-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Título da seção recolhível..."
            className="mt-1"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleCollapsed}
          className="mt-6"
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="border rounded p-4 min-h-[200px]">
          <BlockEditor
            blocks={children}
            onChange={handleChildrenChange}
            postId={postId}
          />
        </div>
      )}
    </div>
  );
}


