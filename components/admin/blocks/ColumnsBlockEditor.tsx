"use client";

import React from 'react';
import BlockEditor from '@/components/admin/BlockEditor';
import type { Columns2BlockPayload, PostBlock } from '@/lib/blocks/types';

interface ColumnsBlockEditorProps {
  initialPayload?: Columns2BlockPayload;
  onChange: (payload: Columns2BlockPayload) => void;
  postId?: string;
}

/**
 * Editor de bloco columns-2 (container de blocos - NÃO usa Lexical)
 */
export default function ColumnsBlockEditor({
  initialPayload,
  onChange,
  postId,
}: ColumnsBlockEditorProps) {
  const children = (initialPayload?.children || []) as PostBlock[];

  const handleChildrenChange = (newChildren: PostBlock[]) => {
    onChange({
      children: newChildren,
    });
  };

  return (
    <div className="columns-block-editor space-y-4 p-4 border rounded-lg">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Layout em 2 Colunas
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4 min-h-[200px]">
          <div className="text-xs text-gray-500 mb-2">Coluna 1</div>
          <BlockEditor
            blocks={children.filter((_, idx) => idx % 2 === 0)}
            onChange={(blocks) => {
              // Reconstruir array intercalando colunas
              const col1 = blocks;
              const col2 = children.filter((_, idx) => idx % 2 === 1);
              const newChildren: PostBlock[] = [];
              const maxLen = Math.max(col1.length, col2.length);
              for (let i = 0; i < maxLen; i++) {
                if (col1[i]) {
                  newChildren.push({ ...col1[i], position: i * 2 });
                }
                if (col2[i]) {
                  newChildren.push({ ...col2[i], position: i * 2 + 1 });
                }
              }
              handleChildrenChange(newChildren);
            }}
            postId={postId}
          />
        </div>
        
        <div className="border rounded p-4 min-h-[200px]">
          <div className="text-xs text-gray-500 mb-2">Coluna 2</div>
          <BlockEditor
            blocks={children.filter((_, idx) => idx % 2 === 1)}
            onChange={(blocks) => {
              // Reconstruir array intercalando colunas
              const col1 = children.filter((_, idx) => idx % 2 === 0);
              const col2 = blocks;
              const newChildren: PostBlock[] = [];
              const maxLen = Math.max(col1.length, col2.length);
              for (let i = 0; i < maxLen; i++) {
                if (col1[i]) {
                  newChildren.push({ ...col1[i], position: i * 2 });
                }
                if (col2[i]) {
                  newChildren.push({ ...col2[i], position: i * 2 + 1 });
                }
              }
              handleChildrenChange(newChildren);
            }}
            postId={postId}
          />
        </div>
      </div>
    </div>
  );
}


