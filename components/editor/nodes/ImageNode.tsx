import { DecoratorNode } from 'lexical';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { Loader2, AlertCircle, MoreHorizontal, Trash2, RefreshCw } from 'lucide-react';

type SerializedImageNode = {
  type: 'image';
  version: 1;
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  size?: 'small' | 'medium' | 'large' | 'original';
};

type ImageSize = 'small' | 'medium' | 'large' | 'original';

const SIZE_CLASSES: Record<ImageSize, string> = {
  small: 'max-w-xs',
  medium: 'max-w-md',
  large: 'max-w-2xl',
  original: 'max-w-full',
};

function ImageComponent({
  src,
  alt,
  caption: initialCaption,
  size = 'original',
  nodeKey,
  onCaptionChange,
  onDelete,
  onReplace,
}: {
  src: string;
  alt?: string;
  caption?: string;
  size?: ImageSize;
  nodeKey: string;
  onCaptionChange: (caption: string) => void;
  onDelete: () => void;
  onReplace: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>(size);
  const [showMenu, setShowMenu] = useState(false);
  const [caption, setCaption] = useState(initialCaption || '');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoading(false);
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
  }, [src]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCaptionBlur = () => {
    setIsEditingCaption(false);
    onCaptionChange(caption);
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCaptionBlur();
    }
    if (e.key === 'Escape') {
      setCaption(initialCaption || '');
      setIsEditingCaption(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Carregando imagem...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <div>
          <p className="text-sm font-medium">Erro ao carregar imagem</p>
          <p className="text-xs text-red-500 mt-1">{src}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 group relative" contentEditable={false}>
      {/* Container da imagem com menu */}
      <div className="relative">
        <img
          src={src}
          alt={alt || ''}
          className={`${SIZE_CLASSES[imageSize]} mx-auto rounded-lg shadow-sm`}
          style={{ display: 'block' }}
        />
        
        {/* Menu de 3 pontos */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            contentEditable={false}
          >
            <MoreHorizontal className="h-4 w-4 text-gray-700" />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onReplace();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Trocar imagem
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Deletar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legenda editável */}
      <div className="mt-2 text-center">
        {isEditingCaption ? (
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={handleCaptionBlur}
            onKeyDown={handleCaptionKeyDown}
            placeholder="Adicionar legenda..."
            className="w-full text-center text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
            style={{ fontSize: '11px' }}
            autoFocus
            contentEditable={false}
          />
        ) : (
          <button
            onClick={() => setIsEditingCaption(true)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            style={{ fontSize: '11px' }}
            contentEditable={false}
          >
            {caption || 'Adicionar legenda...'}
          </button>
        )}
      </div>
    </div>
  );
}

export class ImageNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __alt?: string;
  __caption?: string;
  __size: ImageSize;

  static getType() {
    return 'image';
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__alt, node.__caption, node.__size, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, alt, caption, size = 'original' } = serializedNode;
    const node = $createImageNode(src, alt, caption, size);
    return node;
  }

  constructor(src: string, alt?: string, caption?: string, size: ImageSize = 'original', key?: string) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__caption = caption;
    this.__size = size;
  }

  createDOM() {
    const div = document.createElement('div');
    div.className = 'image-node-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
      caption: this.__caption,
      size: this.__size,
    };
  }

  isInline() {
    return false;
  }

  getTextContent(_includeInert?: boolean) {
    return this.__caption || this.__alt || '';
  }

  decorate() {
    const Component = () => {
      const [editor] = useLexicalComposerContext();

      const handleCaptionChange = useCallback((newCaption: string) => {
        editor.update(() => {
          const node = $getNodeByKey(this.__key);
          if (node instanceof ImageNode) {
            const writable = node.getWritable();
            writable.__caption = newCaption;
          }
        });
      }, [editor]);

      const handleDelete = useCallback(() => {
        editor.update(() => {
          const node = $getNodeByKey(this.__key);
          if (node) {
            node.remove();
          }
        });
      }, [editor]);

      const handleReplace = useCallback(() => {
        // Importar dinamicamente para evitar circular dependency
        import('../ImageGalleryModal').then(({ default: ImageGalleryModal }) => {
          // Criar um portal para o modal
          const modalRoot = document.createElement('div');
          document.body.appendChild(modalRoot);
          
          const { createRoot } = require('react-dom/client');
          const root = createRoot(modalRoot);
          
          const handleSelect = (url: string, alt?: string) => {
            editor.update(() => {
              const node = $getNodeByKey(this.__key);
              if (node instanceof ImageNode) {
                const writable = node.getWritable();
                writable.__src = url;
                writable.__alt = alt;
              }
            });
            root.unmount();
            document.body.removeChild(modalRoot);
          };

          const handleClose = () => {
            root.unmount();
            document.body.removeChild(modalRoot);
          };

          const React = require('react');
          root.render(
            React.createElement(ImageGalleryModal, {
              isOpen: true,
              onClose: handleClose,
              onSelectImage: handleSelect,
              type: 'posts'
            })
          );
        });
      }, [editor]);

      return (
        <ImageComponent
          src={this.__src}
          alt={this.__alt}
          caption={this.__caption}
          size={this.__size}
          nodeKey={this.__key}
          onCaptionChange={handleCaptionChange}
          onDelete={handleDelete}
          onReplace={handleReplace}
        />
      );
    };

    return <Component />;
  }

  setSize(size: ImageSize): void {
    const writable = this.getWritable();
    writable.__size = size;
  }

  setAlt(alt: string): void {
    const writable = this.getWritable();
    writable.__alt = alt;
  }

  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  // Permitir que o nó seja deletado com Delete/Backspace
  isKeyboardSelectable(): boolean {
    return true;
  }

  canBeEmpty(): false {
    return false;
  }
}

export function $createImageNode(src: string, alt?: string, caption?: string, size: ImageSize = 'original') {
  const node = new ImageNode(src, alt, caption, size);
  return node;
}

export function $isImageNode(node: any): node is ImageNode {
  return node instanceof ImageNode;
}
