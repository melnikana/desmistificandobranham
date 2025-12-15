"use client";

import { DecoratorNode, EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import React from 'react';

type SerializedColumnsNode = Spread<{
  columnCount: number;
  type: 'columns';
  version: 1;
}, SerializedLexicalNode>;

export class ColumnsNode extends DecoratorNode<React.ReactElement> {
  __columnCount: number;

  static getType(): string {
    return 'columns';
  }

  static clone(node: ColumnsNode): ColumnsNode {
    return new ColumnsNode(node.__columnCount, node.__key);
  }

  constructor(columnCount: number = 2, key?: NodeKey) {
    super(key);
    this.__columnCount = columnCount;
  }

  static importJSON(serializedNode: SerializedColumnsNode): ColumnsNode {
    const node = $createColumnsNode(serializedNode.columnCount);
    return node;
  }

  exportJSON(): SerializedColumnsNode {
    return {
      type: 'columns',
      columnCount: this.__columnCount,
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'grid';
    div.style.gridTemplateColumns = `repeat(${this.__columnCount}, 1fr)`;
    div.style.gap = '1rem';
    div.style.marginTop = '1rem';
    div.style.marginBottom = '1rem';
    
    for (let i = 0; i < this.__columnCount; i++) {
      const column = document.createElement('div');
      column.style.padding = '0.5rem';
      column.style.border = '1px dashed #ccc';
      column.style.borderRadius = '0.25rem';
      column.contentEditable = 'true';
      column.textContent = `Coluna ${i + 1}`;
      div.appendChild(column);
    }
    
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getTextContent(): string {
    return '';
  }

  decorate(): React.ReactElement {
    return (
      <div className="grid gap-4 my-4" style={{ gridTemplateColumns: `repeat(${this.__columnCount}, 1fr)` }}>
        {Array.from({ length: this.__columnCount }).map((_, i) => (
          <div
            key={i}
            className="p-3 border border-dashed border-gray-300 rounded min-h-[100px] hover:border-gray-400 transition-colors"
            contentEditable
            suppressContentEditableWarning
          >
            <p className="text-gray-400 text-sm">Coluna {i + 1}</p>
          </div>
        ))}
      </div>
    );
  }
}

export function $createColumnsNode(columnCount: number = 2): ColumnsNode {
  return new ColumnsNode(columnCount);
}

export function $isColumnsNode(node: any): node is ColumnsNode {
  return node instanceof ColumnsNode;
}




