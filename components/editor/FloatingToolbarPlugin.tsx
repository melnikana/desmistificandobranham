"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
  ElementFormatType,
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { mergeRegister } from "@lexical/utils";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link as LinkIcon, 
  Type, 
  Highlighter, 
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent
} from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { useTextColor } from "@/hooks/useTextColor";
import { TEXT_COLORS, HIGHLIGHT_COLORS } from "@/lib/editorColors";

export default function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isText, setIsText] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState<string>('default');
  const [currentHighlight, setCurrentHighlight] = useState<string | undefined>(undefined);
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');

  const { applyTextColor, applyHighlight, removeTextColor, removeHighlight } = useTextColor();

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementDOM = editor.getElementByKey(element.getKey());

      if (elementDOM !== null) {
        setIsText(!selection.isCollapsed() && selection.getTextContent() !== "");
      }

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      // Update element format (alignment)
      const format = element.getFormatType?.() || 'left';
      setElementFormat(format as ElementFormatType);

      // Update link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    } else {
      setIsText(false);
    }
  }, [editor]);

  const positionToolbar = useCallback(() => {
    const toolbarElem = toolbarRef.current;
    if (!toolbarElem) return;

    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
      
      const elementDOM = editor.getElementByKey(element.getKey());
      if (!elementDOM) return;

      const rect = elementDOM.getBoundingClientRect();
      const toolbarRect = toolbarElem.getBoundingClientRect();
      
      // Posiciona acima do bloco com gap de 32px, alinhado à esquerda
      const top = rect.top - toolbarRect.height - 32 + window.scrollY;
      const left = rect.left + window.scrollX;

      toolbarElem.style.top = `${Math.max(10, top)}px`;
      toolbarElem.style.left = `${Math.max(10, left)}px`;
      toolbarElem.style.opacity = "1";
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    if (isText) {
      positionToolbar();
    }
  }, [isText, positionToolbar]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt("Enter URL:");
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const handleAlignment = useCallback((alignment: ElementFormatType) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  }, [editor]);

  const handleIndent = useCallback(() => {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  }, [editor]);

  const handleOutdent = useCallback(() => {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  }, [editor]);

  const handleSelectTextColor = useCallback((color: string) => {
    applyTextColor(color);
    setCurrentTextColor(color);
    setShowTextColorPicker(false);
  }, [applyTextColor]);

  const handleRemoveTextColor = useCallback(() => {
    removeTextColor();
    setCurrentTextColor('default');
    setShowTextColorPicker(false);
  }, [removeTextColor]);

  const handleSelectHighlight = useCallback((color: string) => {
    applyHighlight(color);
    setCurrentHighlight(color);
    setShowHighlightPicker(false);
  }, [applyHighlight]);

  const handleRemoveHighlight = useCallback(() => {
    removeHighlight();
    setCurrentHighlight(undefined);
    setShowHighlightPicker(false);
  }, [removeHighlight]);

  if (!isText) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-xl px-1.5 py-1 opacity-0 transition-opacity"
      style={{ pointerEvents: "auto" }}
    >
      <button
        onClick={() => formatText("bold")}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          isBold ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => formatText("italic")}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          isItalic ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        onClick={() => formatText("underline")}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          isUnderline ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </button>
      <button
        onClick={() => formatText("strikethrough")}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          isStrikethrough ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-gray-300 mx-1" />
      <button
        onClick={insertLink}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          isLink ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-gray-300 mx-1" />
      {/* Botão de Cor de Texto */}
      <div className="relative">
        <button
          onClick={() => {
            setShowTextColorPicker(!showTextColorPicker);
            setShowHighlightPicker(false);
          }}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 ${
            showTextColorPicker ? "bg-gray-100 text-gray-900" : ""
          }`}
          title="Cor do texto"
        >
          <div className="relative">
            <Type className="h-4 w-4" />
            <div
              className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
              style={{
                backgroundColor: currentTextColor !== 'default' 
                  ? TEXT_COLORS.find(c => c.value === currentTextColor)?.hex 
                  : '#37352F'
              }}
            />
          </div>
          <ChevronDown className="h-3 w-3" />
        </button>
        {showTextColorPicker && (
          <ColorPicker
            colors={TEXT_COLORS}
            currentColor={currentTextColor}
            onSelectColor={handleSelectTextColor}
            onRemoveColor={handleRemoveTextColor}
            type="text"
          />
        )}
      </div>
      {/* Botão de Highlight */}
      <div className="relative">
        <button
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker);
            setShowTextColorPicker(false);
          }}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 ${
            showHighlightPicker ? "bg-gray-100 text-gray-900" : ""
          }`}
          title="Destacar texto"
        >
          <div className="relative">
            <Highlighter className="h-4 w-4" />
            {currentHighlight && (
              <div
                className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                style={{
                  backgroundColor: HIGHLIGHT_COLORS.find(c => c.value === currentHighlight)?.hex
                }}
              />
            )}
          </div>
          <ChevronDown className="h-3 w-3" />
        </button>
        {showHighlightPicker && (
          <ColorPicker
            colors={HIGHLIGHT_COLORS}
            currentColor={currentHighlight}
            onSelectColor={handleSelectHighlight}
            onRemoveColor={handleRemoveHighlight}
            type="highlight"
          />
        )}
      </div>
      <div className="w-px h-4 bg-gray-300 mx-1" />
      {/* Botões de Alinhamento */}
      <button
        onClick={() => handleAlignment('left')}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          elementFormat === 'left' ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Alinhar à esquerda"
      >
        <AlignLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleAlignment('center')}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          elementFormat === 'center' ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Centralizar"
      >
        <AlignCenter className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleAlignment('right')}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          elementFormat === 'right' ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Alinhar à direita"
      >
        <AlignRight className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleAlignment('justify')}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
          elementFormat === 'justify' ? "bg-gray-100 text-gray-900" : ""
        }`}
        title="Justificar"
      >
        <AlignJustify className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-gray-300 mx-1" />
      {/* Botões de Indentação */}
      <button
        onClick={handleIndent}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="Aumentar recuo"
      >
        <Indent className="h-4 w-4" />
      </button>
      <button
        onClick={handleOutdent}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="Diminuir recuo"
      >
        <Outdent className="h-4 w-4" />
      </button>
    </div>
  );
}

