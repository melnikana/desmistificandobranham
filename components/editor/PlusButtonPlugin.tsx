"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  ElementNode,
} from "lexical";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { INSERT_HORIZONTAL_RULE_COMMAND, HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { $createImageNode } from "./nodes/ImageNode";
import { $createTranslationQuoteNode } from "./nodes/TranslationQuoteNode";
import ImageGalleryModal from "./ImageGalleryModal";
import { 
  Plus, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Image,
  Type,
  Quote,
  Code,
  Minus,
  Table2,
  Columns3,
  FileImage,
  Youtube,
  ChevronDown,
  Feather,
  GripVertical
} from "lucide-react";

type BlockCommand = {
  id: string;
  label: string;
  description: string;
  icon: string;
  onSelect: () => void;
};

export default function PlusButtonPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showButton, setShowButton] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [dragHandlePosition, setDragHandlePosition] = useState({ top: 0, left: 0 });
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [currentBlockKey, setCurrentBlockKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredBlock, setHoveredBlock] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to transform block type while preserving content
  const transformBlockType = useCallback((createNode: () => ElementNode) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      const targetNode = anchorNode.getTopLevelElementOrThrow();
      
      const newNode = createNode();
      const children = targetNode.getChildren();
      children.forEach(child => newNode.append(child));
      
      targetNode.replace(newNode);
      newNode.select();
    });
  }, [editor]);

  const handleImageSelect = useCallback((url: string, alt?: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const imageNode = $createImageNode(url, alt);
        const paragraphNode = $createParagraphNode();
        selection.insertNodes([imageNode, paragraphNode]);
        paragraphNode.select();
      }
    });
  }, [editor]);

  const commands: BlockCommand[] = [
    {
      id: "normal",
      label: "Normal",
      description: "Parágrafo de texto",
      icon: "type",
      onSelect: () => transformBlockType(() => $createParagraphNode()),
    },
    {
      id: "heading1",
      label: "Heading 1",
      description: "Título grande",
      icon: "heading1",
      onSelect: () => transformBlockType(() => $createHeadingNode("h1")),
    },
    {
      id: "heading2",
      label: "Heading 2",
      description: "Título médio",
      icon: "heading2",
      onSelect: () => transformBlockType(() => $createHeadingNode("h2")),
    },
    {
      id: "heading3",
      label: "Heading 3",
      description: "Título pequeno",
      icon: "heading3",
      onSelect: () => transformBlockType(() => $createHeadingNode("h3")),
    },
    {
      id: "numberlist",
      label: "Numbered List",
      description: "Lista numerada",
      icon: "listordered",
      onSelect: () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      },
    },
    {
      id: "bulletlist",
      label: "Bullet List",
      description: "Lista com marcadores",
      icon: "list",
      onSelect: () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      },
    },
    {
      id: "branham-quote",
      label: "Citação Branham",
      description: "Citação com fonte de tradução",
      icon: "feather",
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const translationNode = $createTranslationQuoteNode();
            selection.insertNodes([translationNode]);
            
            // Adiciona parágrafo vazio após
            const paragraphNode = $createParagraphNode();
            translationNode.insertAfter(paragraphNode);
            paragraphNode.selectEnd();
          }
        });
        setShowMenu(false);
      },
    },
    {
      id: "quote",
      label: "Quote",
      description: "Citação",
      icon: "quote",
      onSelect: () => transformBlockType(() => $createQuoteNode()),
    },
    {
      id: "codeblock",
      label: "Code Block",
      description: "Bloco de código",
      icon: "code",
      onSelect: () => transformBlockType(() => $createCodeNode()),
    },
    {
      id: "horizontalrule",
      label: "Horizontal Rule",
      description: "Linha divisória",
      icon: "minus",
      onSelect: () => {
        // Dispara o comando para inserir o HR
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
        
        // Aguarda um momento e então adiciona o parágrafo após o HR
        requestAnimationFrame(() => {
          setTimeout(() => {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const topLevelElement = anchorNode.getTopLevelElementOrThrow();
                
                // Verifica se o elemento atual é um HR
                if (topLevelElement instanceof HorizontalRuleNode) {
                  // Adiciona parágrafo após o HR
                  const paragraphNode = $createParagraphNode();
                  topLevelElement.insertAfter(paragraphNode);
                  paragraphNode.selectEnd();
                } else {
                  // Procura pelo HR anterior
                  let prevSibling = topLevelElement.getPreviousSibling();
                  while (prevSibling) {
                    if (prevSibling instanceof HorizontalRuleNode) {
                      const paragraphNode = $createParagraphNode();
                      prevSibling.insertAfter(paragraphNode);
                      paragraphNode.selectEnd();
                      return;
                    }
                    prevSibling = prevSibling.getPreviousSibling();
                  }
                  
                  // Se não encontrou HR, adiciona parágrafo após o elemento atual
                  const paragraphNode = $createParagraphNode();
                  topLevelElement.insertAfter(paragraphNode);
                  paragraphNode.selectEnd();
                }
              }
            });
          }, 100);
        });
        setShowMenu(false);
      },
    },
    {
      id: "image",
      label: "Image",
      description: "Upload de imagem",
      icon: "image",
      onSelect: () => {
        setShowMenu(false);
        setShowImageModal(true);
      },
    },
    {
      id: "table",
      label: "Table",
      description: "Tabela",
      icon: "table",
      onSelect: () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
      },
    },
    {
      id: "columns",
      label: "Columns Layout",
      description: "Layout em colunas",
      icon: "columns",
      onSelect: () => {
        alert("Funcionalidade de colunas em desenvolvimento");
      },
    },
    {
      id: "gif",
      label: "GIF",
      description: "Inserir GIF",
      icon: "fileimage",
      onSelect: () => {
        alert("Funcionalidade GIF em desenvolvimento");
      },
    },
    {
      id: "youtube",
      label: "Youtube Video",
      description: "Embed de vídeo",
      icon: "youtube",
      onSelect: () => {
        const url = prompt("Cole a URL do YouTube:");
        if (url) {
          alert("Funcionalidade YouTube em desenvolvimento");
        }
      },
    },
    {
      id: "collapsible",
      label: "Collapsible container",
      description: "Seção recolhível",
      icon: "chevrondown",
      onSelect: () => {
        alert("Funcionalidade de seção recolhível em desenvolvimento");
      },
    },
  ];

  const handleSelect = useCallback(
    (command: BlockCommand) => {
      command.onSelect();
      setShowMenu(false);
      setSearchQuery('');
    },
    []
  );

  // Filtrar comandos baseado na busca
  const filteredCommands = commands.filter((cmd) => {
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query)
    );
  });

  const updateButtonPosition = useCallback((hoveredElement: HTMLElement | null) => {
    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (!hoveredElement) {
      // Longer delay to allow moving mouse to button
      hideTimeoutRef.current = setTimeout(() => {
        // Double check button/menu/drag handle aren't hovered before hiding
        if (
          !buttonRef.current?.matches(':hover') && 
          !menuRef.current?.matches(':hover') &&
          !dragHandleRef.current?.matches(':hover')
        ) {
          setShowButton(false);
          setCurrentBlockKey(null);
          setHoveredBlock(null);
        }
      }, 500);
      return;
    }

    setHoveredBlock(hoveredElement);

    const rect = hoveredElement.getBoundingClientRect();
    const editorRect = editorElement.getBoundingClientRect();
    const parentContainer = editorElement.parentElement;
    const containerRect = parentContainer?.getBoundingClientRect();
    
    // Calculate position relative to the container
    const relativeTop = rect.top - (containerRect?.top || editorRect.top);
    
    // Posicionar drag handle mais à esquerda e botão + ao lado
    setDragHandlePosition({
      top: relativeTop + 2,
      left: -80, // Mais à esquerda para o drag handle
    });
    
    setButtonPosition({
      top: relativeTop + 2,
      left: -56, // Ao lado do drag handle
    });
    setShowButton(true);
  }, [editor]);

  useEffect(() => {
    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Check if mouse is over the button, menu, or drag handle - keep them visible
      const isDragHandle = target.closest('.drag-handle-container') || target.closest('[data-drag-handle]');
      if (
        buttonRef.current?.contains(target) || 
        menuRef.current?.contains(target) || 
        dragHandleRef.current?.contains(target) ||
        isDragHandle
      ) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        return;
      }
      
      // Find the closest block element (p, h1, h2, h3, ul, ol, blockquote, hr, etc.)
      let blockElement = target.closest('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, hr, .translation-quote-node') as HTMLElement;
      
      // If we're inside the editor but no block found, try getting direct children
      if (!blockElement && editorElement.contains(target)) {
        const children = Array.from(editorElement.children) as HTMLElement[];
        for (const child of children) {
          if (child.contains(target)) {
            blockElement = child;
            break;
          }
        }
      }
      
      // Check if mouse is in the left margin area of the currently hovered block
      if (!blockElement && hoveredBlock) {
        const hoveredRect = hoveredBlock.getBoundingClientRect();
        const editorRect = editorElement.getBoundingClientRect();
        
        // Check if mouse is to the left of the block but within vertical bounds
        // Extended area: 120px to the left of the block (maior margem de segurança)
        if (
          mouseX >= editorRect.left - 120 &&
          mouseX < hoveredRect.left &&
          mouseY >= hoveredRect.top - 15 &&
          mouseY <= hoveredRect.bottom + 15
        ) {
          // Keep showing the button for the hovered block
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }
          return;
        }
      }
      
      if (blockElement && editorElement.contains(blockElement)) {
        updateButtonPosition(blockElement);
      } else {
        updateButtonPosition(null);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Don't hide if moving to button, menu, or drag handle
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (
        buttonRef.current?.contains(relatedTarget) || 
        menuRef.current?.contains(relatedTarget) ||
        dragHandleRef.current?.contains(relatedTarget)
      ) {
        return;
      }
      updateButtonPosition(null);
    };

    editorElement.addEventListener('mousemove', handleMouseMove);
    editorElement.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      editorElement.removeEventListener('mousemove', handleMouseMove);
      editorElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [editor, updateButtonPosition]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (buttonRef.current) {
      const editorElement = editor.getRootElement();
      if (editorElement) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const editorRect = editorElement.getBoundingClientRect();
        
        // Position menu relative to editor container
        const relativeTop = buttonRect.bottom - editorRect.top + editorElement.scrollTop;
        const relativeLeft = buttonRect.left - editorRect.left;
        
        setMenuPosition({
          top: relativeTop + 5,
          left: relativeLeft,
        });
        setShowMenu(!showMenu);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
        setSearchQuery('');
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Auto-focus no campo de busca quando o menu abre
  useEffect(() => {
    if (showMenu && searchInputRef.current) {
      // Pequeno delay para garantir que o menu está renderizado
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showMenu]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "type":
        return <Type className="h-4 w-4" />;
      case "heading1":
        return <Heading1 className="h-4 w-4" />;
      case "heading2":
        return <Heading2 className="h-4 w-4" />;
      case "heading3":
        return <Heading3 className="h-4 w-4" />;
      case "list":
        return <List className="h-4 w-4" />;
      case "listordered":
        return <ListOrdered className="h-4 w-4" />;
      case "feather":
        return <Feather className="h-4 w-4" />;
      case "quote":
        return <Quote className="h-4 w-4" />;
      case "code":
        return <Code className="h-4 w-4" />;
      case "minus":
        return <Minus className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      case "table":
        return <Table2 className="h-4 w-4" />;
      case "columns":
        return <Columns3 className="h-4 w-4" />;
      case "fileimage":
        return <FileImage className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "chevrondown":
        return <ChevronDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <ImageGalleryModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSelectImage={handleImageSelect}
        type="posts"
      />

      {showButton && (
        <>
          {/* Drag Handle */}
          <div
            ref={dragHandleRef}
            className="absolute z-50 w-6 h-6 rounded hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing"
            style={{
              top: `${dragHandlePosition.top}px`,
              left: `${dragHandlePosition.left}px`,
              pointerEvents: 'auto',
            }}
            title="Mover bloco"
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => {
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              if (!showMenu) {
                hideTimeoutRef.current = setTimeout(() => {
                  // Verificar se o mouse não está sobre o menu ou botão
                  if (
                    !menuRef.current?.matches(':hover') &&
                    !buttonRef.current?.matches(':hover')
                  ) {
                    setShowButton(false);
                    setHoveredBlock(null);
                  }
                }, 500);
              }
            }}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Botão + */}
          <button
            ref={buttonRef}
            onClick={handleButtonClick}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => {
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              if (!showMenu) {
                hideTimeoutRef.current = setTimeout(() => {
                  // Verificar se o mouse não está sobre o menu, drag handle ou botão
                  if (
                    !menuRef.current?.matches(':hover') &&
                    !dragHandleRef.current?.matches(':hover') &&
                    !buttonRef.current?.matches(':hover')
                  ) {
                    setShowButton(false);
                    setHoveredBlock(null);
                  }
                }, 500);
              }
            }}
            className="absolute z-50 w-6 h-6 rounded hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
            style={{
              top: `${buttonPosition.top}px`,
              left: `${buttonPosition.left}px`,
              pointerEvents: 'auto',
            }}
            title="Adicionar bloco"
          >
            <Plus className="h-4 w-4" />
          </button>
        </>
      )}

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute z-50 bg-white text-gray-950 rounded-lg border border-gray-200 shadow-lg min-w-[320px] max-w-[340px] flex flex-col"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            maxHeight: '400px',
          }}
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => {
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            hideTimeoutRef.current = setTimeout(() => {
              // Verificar se o mouse não está sobre o botão ou drag handle
              if (
                !buttonRef.current?.matches(':hover') &&
                !dragHandleRef.current?.matches(':hover')
              ) {
                setShowMenu(false);
                setShowButton(false);
                setHoveredBlock(null);
              }
            }, 500);
          }}
        >
          {/* Lista de blocos com scroll customizado */}
          <div 
            className="overflow-y-auto p-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-white hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
            style={{ 
              maxHeight: '280px',
              minHeight: '200px'
            }}
          >
            {filteredCommands.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-gray-500">
                Nenhum bloco encontrado
              </div>
            ) : (
              filteredCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(command);
                  }}
                  className="relative flex cursor-default select-none items-center rounded-md px-2 py-2.5 text-sm outline-none transition-colors hover:bg-gray-100 w-full gap-3"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-600">
                    {getIcon(command.icon)}
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium text-sm text-gray-900">{command.label}</div>
                    <div className="text-xs text-gray-500 truncate">{command.description}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Campo de busca na parte inferior */}
          <div className="border-t border-gray-200 p-2 bg-gray-50/50">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite para filtrar"
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
              onMouseDown={(e) => e.preventDefault()}
            />
          </div>
        </div>
      )}
    </>
  );
}

