"use client";

import React, { useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { supabase } from '@/lib/supabaseClient';
import { $createImageNode, ImageNode } from './nodes/ImageNode';

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const onSelectFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Apenas imagens são permitidas');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('Arquivo maior que 3MB. Escolha um arquivo menor.');
      return;
    }

    setUploading(true);
    try {
      const filePath = `imagens-site/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('imagens-site').upload(filePath, file, { upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('imagens-site').getPublicUrl(filePath);
      const url = urlData.publicUrl;

      editor.update(() => {
        const node = $createImageNode(url, file.name);
        const root = $getRoot();
        root.append(node);
      });
    } catch (e: any) {
      console.error(e);
      alert('Erro ao enviar imagem: ' + (e.message || e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-plugin p-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onSelectFile(e.target.files?.[0] || null)}
      />
      <button
        className="px-3 py-1 bg-white rounded border"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : 'Inserir imagem'}
      </button>
    </div>
  );
}
