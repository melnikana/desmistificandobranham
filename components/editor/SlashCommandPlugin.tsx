"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  TextNode,
  ElementNode,
} from "lexical";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { $createImageNode } from "./nodes/ImageNode";
import { $createTranslationQuoteNode } from "./nodes/TranslationQuoteNode";
import { $createCodeNode } from "@lexical/code";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import ImageGalleryModal from "./ImageGalleryModal";
import { 
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
  Feather
} from "lucide-react";

type SlashCommand = {
  id: string;
  label: string;
  description: string;
  icon: string;
  keywords: string[];
  onSelect: () => void;
};

export default function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const commands: SlashCommand[] = [
    {
      id: "normal",
      label: "Normal",
      description: "Parágrafo de texto",
      icon: "type",
      keywords: ["text", "paragraph", "paragrafo", "texto", "normal"],
      onSelect: () => transformBlockType(() => $createParagraphNode()),
    },
    {
      id: "heading1",
      label: "Heading 1",
      description: "Título grande",
      icon: "heading1",
      keywords: ["h1", "heading", "titulo", "título"],
      onSelect: () => transformBlockType(() => $createHeadingNode("h1")),
    },
    {
      id: "heading2",
      label: "Heading 2",
      description: "Título médio",
      icon: "heading2",
      keywords: ["h2", "heading", "titulo", "título"],
      onSelect: () => transformBlockType(() => $createHeadingNode("h2")),
    },
    {
      id: "heading3",
      label: "Heading 3",
      description: "Título pequeno",
      icon: "heading3",
      keywords: ["h3", "heading", "titulo", "título"],
      onSelect: () => transformBlockType(() => $createHeadingNode("h3")),
    },
    {
      id: "numberlist",
      label: "Numbered List",
      description: "Lista numerada",
      icon: "listordered",
      keywords: ["number", "list", "ol", "lista", "numerada"],
      onSelect: () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      },
    },
    {
      id: "bulletlist",
      label: "Bullet List",
      description: "Lista com marcadores",
      icon: "list",
      keywords: ["bullet", "list", "ul", "lista", "marcadores"],
      onSelect: () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      },
    },
    {
      id: "branham-quote",
      label: "Citação Branham",
      description: "Citação com fonte de tradução",
      icon: "feather",
      keywords: ["branham", "citação", "citacao", "tradução", "traducao", "quote"],
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
      keywords: ["quote", "citação", "citacao", "blockquote"],
      onSelect: () => transformBlockType(() => $createQuoteNode()),
    },
    {
      id: "codeblock",
      label: "Code Block",
      description: "Bloco de código",
      icon: "code",
      keywords: ["code", "codigo", "código", "programming"],
      onSelect: () => transformBlockType(() => $createCodeNode()),
    },
    {
      id: "horizontalrule",
      label: "Horizontal Rule",
      description: "Linha divisória",
      icon: "minus",
      keywords: ["hr", "horizontal", "rule", "divisor", "linha", "separator"],
      onSelect: () => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
      },
    },
    {
      id: "image",
      label: "Image",
      description: "Upload de imagem",
      icon: "image",
      keywords: ["image", "imagem", "photo", "foto", "picture"],
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
      keywords: ["table", "tabela", "grid"],
      onSelect: () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
      },
    },
    {
      id: "columns",
      label: "Columns Layout",
      description: "Layout em colunas",
      icon: "columns",
      keywords: ["columns", "colunas", "layout"],
      onSelect: () => {
        alert("Funcionalidade de colunas em desenvolvimento");
      },
    },
    {
      id: "gif",
      label: "GIF",
      description: "Inserir GIF",
      icon: "fileimage",
      keywords: ["gif", "animation", "animação"],
      onSelect: () => {
        alert("Funcionalidade GIF em desenvolvimento");
      },
    },
    {
      id: "youtube",
      label: "Youtube Video",
      description: "Embed de vídeo",
      icon: "youtube",
      keywords: ["youtube", "video", "vídeo", "embed"],
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
      keywords: ["collapsible", "toggle", "accordion", "recolhível"],
      onSelect: () => {
        alert("Funcionalidade de seção recolhível em desenvolvimento");
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.keywords.some((keyword) => keyword.includes(query))
    );
  });

  const handleSelect = useCallback(
    (command: SlashCommand) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Remove the '/' and search text
          const anchorNode = selection.anchor.getNode();
          if (anchorNode instanceof TextNode) {
            const text = anchorNode.getTextContent();
            const slashIndex = text.lastIndexOf("/");
            if (slashIndex !== -1) {
              const before = text.substring(0, slashIndex);
              anchorNode.setTextContent(before);
            }
          }
        }
      });

      command.onSelect();
      setShowMenu(false);
      setSearchQuery("");
      setSelectedIndex(0);
    },
    [editor]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const selection = window.getSelection();
      if (!selection || !showMenu) return;

      const anchorNode = selection.anchorNode;
      if (!anchorNode) return;

      const textContent = anchorNode.textContent || "";
      const caretPos = selection.anchorOffset;
      const textBefore = textContent.substring(0, caretPos);
      const slashIndex = textBefore.lastIndexOf("/");

      if (slashIndex === -1) {
        setShowMenu(false);
        return;
      }

      const query = textBefore.substring(slashIndex + 1);
      setSearchQuery(query);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showMenu]);

  useEffect(() => {
    const removeListener = editor.registerTextContentListener((textContent) => {
      const selection = window.getSelection();
      if (!selection) return;

      const anchorNode = selection.anchorNode;
      if (!anchorNode) return;

      const text = anchorNode.textContent || "";
      const caretPos = selection.anchorOffset;
      const textBefore = text.substring(0, caretPos);
      const slashIndex = textBefore.lastIndexOf("/");

      if (slashIndex !== -1 && slashIndex === caretPos - 1) {
        // Just typed '/'
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Get editor container for relative positioning
        const editorElement = document.querySelector('[contenteditable="true"]');
        if (editorElement) {
          const editorRect = editorElement.getBoundingClientRect();
          const scrollTop = editorElement.scrollTop || 0;
          
          setMenuPosition({
            top: rect.bottom - editorRect.top + scrollTop + 5,
            left: rect.left - editorRect.left,
          });
          setShowMenu(true);
          setSearchQuery("");
          setSelectedIndex(0);
        }
      } else if (slashIndex === -1) {
        setShowMenu(false);
      }
    });

    return removeListener;
  }, [editor]);

  useEffect(() => {
    if (!showMenu) return;

    return editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      () => {
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, showMenu, filteredCommands.length]);

  useEffect(() => {
    if (!showMenu) return;

    return editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      () => {
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, showMenu, filteredCommands.length]);

  useEffect(() => {
    if (!showMenu) return;

    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (filteredCommands[selectedIndex]) {
          event?.preventDefault();
          handleSelect(filteredCommands[selectedIndex]);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, showMenu, selectedIndex, filteredCommands, handleSelect]);

  useEffect(() => {
    if (!showMenu) return;

    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        setShowMenu(false);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, showMenu]);

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
      {showMenu && filteredCommands.length > 0 && (
        <div
          ref={menuRef}
          className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[280px] max-w-[320px]"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          {filteredCommands.map((command, index) => (
            <button
              key={command.id}
              onClick={() => handleSelect(command)}
              className={`w-full px-4 py-2.5 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                index === selectedIndex ? "bg-gray-100" : ""
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-gray-600">
                {getIcon(command.icon)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">{command.label}</div>
                <div className="text-xs text-gray-500 truncate">{command.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <ImageGalleryModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSelectImage={handleImageSelect}
        type="posts"
      />
    </>
  );
}

