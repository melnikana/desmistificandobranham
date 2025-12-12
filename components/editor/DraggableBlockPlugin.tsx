"use client";

import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// Basic draggable implementation: adds handles and data-draggable attribute
export default function DraggableBlockPlugin() {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    const root = document.querySelector('.editor-content');
    if (!root) return;

    let dragged: HTMLElement | null = null;

    function handleDragStart(e: DragEvent) {
      const target = e.target as HTMLElement;
      if (!target) return;
      dragged = target.closest('.block') as HTMLElement;
      if (!dragged) return;
      e.dataTransfer?.setData('text/plain', 'dragged');
      dragged.style.opacity = '0.5';
    }

    function handleDragEnd() {
      if (dragged) dragged.style.opacity = '';
      dragged = null;
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault();
    }

    root.addEventListener('dragstart', handleDragStart as any);
    root.addEventListener('dragend', handleDragEnd as any);
    root.addEventListener('dragover', handleDragOver as any);

    return () => {
      root.removeEventListener('dragstart', handleDragStart as any);
      root.removeEventListener('dragend', handleDragEnd as any);
      root.removeEventListener('dragover', handleDragOver as any);
    };
  }, [editor]);

  return null;
}
