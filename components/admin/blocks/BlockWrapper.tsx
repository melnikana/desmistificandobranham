"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  GripVertical,
  Type,
  Heading1,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Image,
  FileImage,
  Youtube,
  Table2,
  Columns3,
  ChevronDown,
  Feather,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PostBlock, BlockType } from '@/lib/blocks/types';

interface BlockWrapperProps {
  block: PostBlock;
  index: number;
  totalBlocks: number;
  onAddBlock: (type: BlockType, position: number) => void;
  onUpdateBlock: (blockId: string, payload: any) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onTransformBlock?: (blockId: string, newType: BlockType) => void;
  onCheckEmpty?: () => boolean;
  isLexicalBlock?: boolean;
  children: React.ReactNode;
}

/**
 * Wrapper para cada bloco com botão +, drag handle e controles
 * Mantém a mesma estrutura visual do PlusButtonPlugin atual
 */
export default function BlockWrapper({
  block,
  index,
  totalBlocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onTransformBlock,
  onCheckEmpty,
  isLexicalBlock = false,
  children,
}: BlockWrapperProps) {
  const [showButton, setShowButton] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [dragHandlePosition, setDragHandlePosition] = useState({ top: 0, left: 0 });
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragHandleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Interceptar Backspace antes do Lexical processar
  // Usar event listener na fase de captura para pegar eventos de elementos filhos
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleKeyDownCapture = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Não processar se o primeiro bloco - prevenir completamente
        if (index === 0) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        // Para blocos Lexical: verificar se está vazio
        if (isLexicalBlock && onCheckEmpty) {
          const isEmpty = onCheckEmpty();
          if (isEmpty) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[BlockWrapper] Deleting Lexical block:', block.id);
            onDeleteBlock(block.id);
            return;
          }
        }
        
        // Para blocos não-Lexical: remover se estiver ativo (hover/focado)
        if (!isLexicalBlock && isActive) {
          e.preventDefault();
          e.stopPropagation();
          console.log('[BlockWrapper] Deleting non-Lexical block:', block.id);
          onDeleteBlock(block.id);
          return;
        }
      }
    };

    // Usar capture phase para interceptar antes do Lexical
    wrapper.addEventListener('keydown', handleKeyDownCapture, true);

    return () => {
      wrapper.removeEventListener('keydown', handleKeyDownCapture, true);
    };
  }, [block.id, index, isLexicalBlock, isActive, onCheckEmpty, onDeleteBlock]);

  // Atualizar posição do botão + e drag handle
  const updateButtonPosition = useCallback(() => {
    if (!wrapperRef.current) return;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlockWrapper.tsx:73',message:'Calculating button positions',data:{blockId:block.id,blockIndex:index},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Os botões devem sempre estar no topo do bloco, à esquerda do conteúdo
    // Posição fixa relativa ao BlockWrapper (não ao container pai)
    // Isso garante que os botões sempre fiquem alinhados, mesmo quando novos blocos são criados
    
    const buttonSpacing = 32; // Espaçamento entre botões e conteúdo
    const buttonGap = 24; // Espaçamento entre os dois botões
    const dragHandleLeft = -buttonSpacing - buttonGap; // Drag handle mais à esquerda (-56px)
    const plusButtonLeft = -buttonSpacing; // Plus button a 32px à esquerda do conteúdo (-32px)
    
    // Posicionar botões no topo do bloco (8px do topo para alinhar com paddingTop do ContentEditable)
    // Usar posição fixa relativa ao BlockWrapper
    const buttonTop = 8;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlockWrapper.tsx:95',message:'Setting button positions',data:{buttonTop,leftDrag:dragHandleLeft,leftButton:plusButtonLeft,buttonSpacing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    setDragHandlePosition({
      top: buttonTop,
      left: dragHandleLeft,
    });
    
    setButtonPosition({
      top: buttonTop,
      left: plusButtonLeft,
    });
  }, [block.id, index]);

  // Recalcular posição dos botões quando o bloco mudar, index mudar ou quando o DOM atualizar
  useEffect(() => {
    if (wrapperRef.current) {
      // Sempre recalcular quando o bloco ou index mudar (novos blocos criados)
      // Usar requestAnimationFrame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        updateButtonPosition();
      });
    }
  }, [block.id, index, updateButtonPosition]);
  
  // Recalcular quando showButton mudar também
  useEffect(() => {
    if (showButton && wrapperRef.current) {
      requestAnimationFrame(() => {
        updateButtonPosition();
      });
    }
  }, [showButton, updateButtonPosition]);

  // Detectar hover no wrapper e atualizar posição
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleMouseEnter = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      updateButtonPosition();
      setShowButton(true);
      setIsActive(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      updateButtonPosition();
      setShowButton(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (
        buttonRef.current?.contains(relatedTarget) || 
        menuRef.current?.contains(relatedTarget) ||
        dragHandleRef.current?.contains(relatedTarget)
      ) {
        return;
      }

      if (!showMenu) {
        hideTimeoutRef.current = setTimeout(() => {
          if (
            !buttonRef.current?.matches(':hover') && 
            !menuRef.current?.matches(':hover') &&
            !dragHandleRef.current?.matches(':hover')
          ) {
            setShowButton(false);
            setIsActive(false);
          }
        }, 500);
      } else {
        setIsActive(false);
      }
    };

    const handleScroll = () => {
      if (showButton) {
        updateButtonPosition();
      }
    };

    wrapper.addEventListener('mouseenter', handleMouseEnter);
    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updateButtonPosition);

    return () => {
      wrapper.removeEventListener('mouseenter', handleMouseEnter);
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updateButtonPosition);
    };
  }, [updateButtonPosition, showMenu, showButton]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (buttonRef.current && wrapperRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      
      setMenuPosition({
        top: buttonRect.bottom - wrapperRect.top + 5,
        left: buttonRect.left - wrapperRect.left,
      });
      setShowMenu(!showMenu);
      setSearchQuery('');
      
      // Focar no input de busca quando o menu abrir
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    // O botão "+" SEMPRE transforma o bloco atual, nunca cria novo bloco
    // Verificar se o bloco atual é Lexical e o novo tipo também é Lexical
    const isLexicalBlock = ['text', 'heading', 'bullet_list', 'numbered_list', 'quote', 'code_block', 'citacao_branham'].includes(block.type);
    const isNewTypeLexical = ['text', 'heading', 'bullet_list', 'numbered_list', 'quote', 'code_block', 'citacao_branham'].includes(type);
    
    // Se ambos são Lexical, transformar usando onTransformBlock
    if (isLexicalBlock && isNewTypeLexical && onTransformBlock) {
      onTransformBlock(block.id, type);
      setShowMenu(false);
      return;
    }
    
    // Se o bloco atual não é Lexical mas o novo tipo é Lexical, ou vice-versa
    // Por enquanto, só transformamos blocos Lexical para Lexical
    // Para outros casos, apenas fechar o menu (não criar novo bloco)
    if (onTransformBlock && isLexicalBlock) {
      // Tentar transformar mesmo que o novo tipo não seja Lexical
      // Isso pode não funcionar, mas pelo menos não cria novo bloco
      setShowMenu(false);
      return;
    }
    
    // Se não há onTransformBlock disponível, apenas fechar o menu
    // NUNCA criar novo bloco via botão "+"
    setShowMenu(false);
  };

  const blockTypes: { id: BlockType; label: string; icon: string }[] = [
    { id: 'text', label: 'Parágrafo', icon: 'type' },
    { id: 'heading', label: 'Título', icon: 'heading1' },
    { id: 'bullet_list', label: 'Lista com Marcadores', icon: 'list' },
    { id: 'numbered_list', label: 'Lista Numerada', icon: 'listordered' },
    { id: 'citacao_branham', label: 'Citação Branham', icon: 'feather' },
    { id: 'quote', label: 'Citação', icon: 'quote' },
    { id: 'code_block', label: 'Código', icon: 'code' },
    { id: 'separator', label: 'Separador', icon: 'minus' },
    { id: 'image', label: 'Imagem', icon: 'image' },
    { id: 'gif', label: 'GIF', icon: 'fileimage' },
    { id: 'youtube_video', label: 'Vídeo YouTube', icon: 'youtube' },
    { id: 'table', label: 'Tabela', icon: 'table' },
    { id: 'columns-2', label: '2 Colunas', icon: 'columns' },
    { id: 'collapsible_container', label: 'Seção Recolhível', icon: 'chevrondown' },
  ];

  const getIcon = (iconName: string) => {
    const iconClass = "h-4 w-4";
    switch (iconName) {
      case "type": return <Type className={iconClass} />;
      case "heading1": return <Heading1 className={iconClass} />;
      case "list": return <List className={iconClass} />;
      case "listordered": return <ListOrdered className={iconClass} />;
      case "quote": return <Quote className={iconClass} />;
      case "code": return <Code className={iconClass} />;
      case "minus": return <Minus className={iconClass} />;
      case "image": return <Image className={iconClass} />;
      case "fileimage": return <FileImage className={iconClass} />;
      case "youtube": return <Youtube className={iconClass} />;
      case "table": return <Table2 className={iconClass} />;
      case "columns": return <Columns3 className={iconClass} />;
      case "chevrondown": return <ChevronDown className={iconClass} />;
      case "feather": return <Feather className={iconClass} />;
      default: return <Plus className={iconClass} />;
    }
  };

  // Filtrar blocos baseado na busca
  const filteredBlockTypes = blockTypes.filter((type) => {
    const query = searchQuery.toLowerCase();
    return (
      type.label.toLowerCase().includes(query) ||
      type.id.toLowerCase().includes(query)
    );
  });

  return (
    <div
      ref={wrapperRef}
      className="block-wrapper group relative"
      style={{ position: 'relative', minHeight: '50px', width: '100%', marginBottom: '2px' }}
    >
      {/* Drag Handle */}
      {showButton && (
        <button
          ref={dragHandleRef}
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
                setShowButton(false);
              }, 500);
            }
          }}
          className="absolute z-50 w-6 h-6 rounded hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-grab"
          style={{
            top: `${dragHandlePosition.top}px`,
            left: `${dragHandlePosition.left}px`,
            pointerEvents: 'auto',
          }}
          title="Mover bloco"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {/* Botão + */}
      {showButton && (
        <>
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
                  setShowButton(false);
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

          {/* Menu de seleção de blocos */}
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
                  if (
                    !buttonRef.current?.matches(':hover') &&
                    !dragHandleRef.current?.matches(':hover')
                  ) {
                    setShowMenu(false);
                    setShowButton(false);
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
                {filteredBlockTypes.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    Nenhum bloco encontrado
                  </div>
                ) : (
                  filteredBlockTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddBlock(type.id);
                      }}
                      className="relative flex cursor-default select-none items-center rounded-md px-2 py-2.5 text-sm outline-none transition-colors hover:bg-gray-100 w-full gap-3"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-600">
                        {getIcon(type.icon)}
                      </span>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-sm text-gray-900">{type.label}</div>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredBlockTypes.length > 0) {
                      handleAddBlock(filteredBlockTypes[0].id);
                    }
                    if (e.key === 'Escape') {
                      setShowMenu(false);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Conteúdo do bloco - alinhado com o título (sem padding adicional, pois o container pai já tem paddingLeft: 80px) */}
      <div className="block-content" style={{ paddingLeft: '0', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}

