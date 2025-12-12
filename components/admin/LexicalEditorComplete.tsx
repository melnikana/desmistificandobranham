"use client";

import React, { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  TextFormatType,
  ElementFormatType,
  LexicalEditor,
} from "lexical";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $generateHtmlFromNodes } from "@lexical/html";

type Props = {
  onChange: (payload: { text: string; json: any; html?: string }) => void;
  placeholder?: React.ReactNode;
};

const SUPPORTED_URL_PROTOCOLS = ["http://", "https://", "mailto:", "tel:"];

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return SUPPORTED_URL_PROTOCOLS.some((protocol) => url.startsWith(protocol));
  }
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
    }
  }, []);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const applyHeading = (level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, level as ElementFormatType);
  };

  const toggleFormat = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url && isValidUrl(url)) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    } else if (url) {
      alert("Invalid URL");
    }
  };

  const insertQuote = () => {
    // Quote insertion is handled by QuoteNode, not FORMAT_ELEMENT_COMMAND
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        console.log("Quote insertion would require custom implementation");
      }
    });
  };

  const insertCodeBlock = () => {
    // Code block insertion is handled by CodeNode, not FORMAT_ELEMENT_COMMAND
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        console.log("Code block insertion would require custom implementation");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-b" style={{ backgroundColor: "#F7F7F7" }}>
      {/* Row 1: Undo/Redo */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Undo"
          className="px-2 py-1 rounded"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
        >
          ↶
        </button>
        <button
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="Redo"
          className="px-2 py-1 rounded"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
        >
          ↷
        </button>
      </div>

      {/* Row 2: Format */}
      <div className="flex gap-1 flex-wrap">
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value === "normal") {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "p" as ElementFormatType);
            } else if (value.startsWith("h")) {
              applyHeading(value as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");
            }
          }}
          className="px-2 py-1 border rounded"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
        >
          <option value="normal">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <button
          onClick={() => toggleFormat("bold")}
          className={`px-2 py-1 rounded font-bold border`}
          style={{ backgroundColor: isBold ? "#121212" : "#ffffff", color: isBold ? "#ffffff" : "#121212" }}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={() => toggleFormat("italic")}
          className={`px-2 py-1 rounded italic border`}
          style={{ backgroundColor: isItalic ? "#121212" : "#ffffff", color: isItalic ? "#ffffff" : "#121212" }}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          onClick={() => toggleFormat("underline")}
          className={`px-2 py-1 rounded underline border`}
          style={{ backgroundColor: isUnderline ? "#121212" : "#ffffff", color: isUnderline ? "#ffffff" : "#121212" }}
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          onClick={() => toggleFormat("strikethrough")}
          className={`px-2 py-1 rounded line-through border`}
          style={{ backgroundColor: isStrikethrough ? "#121212" : "#ffffff", color: isStrikethrough ? "#ffffff" : "#121212" }}
          title="Strikethrough"
        >
          S
        </button>
        <button
          onClick={() => toggleFormat("code")}
          className={`px-2 py-1 rounded font-mono text-sm border`}
          style={{ backgroundColor: isCode ? "#121212" : "#ffffff", color: isCode ? "#ffffff" : "#121212" }}
          title="Code"
        >
          &lt;/&gt;
        </button>
      </div>

      {/* Row 3: Lists and Layout */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          className="px-2 py-1 rounded border"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          className="px-2 py-1 rounded border"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
          className="px-2 py-1 rounded border"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
          title="Indent"
        >
          &gt;&gt;
        </button>
        <button
          onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
          className="px-2 py-1 rounded border"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
          title="Outdent"
        >
          &lt;&lt;
        </button>
        <button
          onClick={insertLink}
          className="px-2 py-1 rounded border"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
          title="Insert Link"
        >
          🔗 Link
        </button>
        <button
          onClick={insertQuote}
          className="px-2 py-1 rounded border"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
          title="Insert Quote"
        >
          " Quote
        </button>
        <button
          onClick={insertCodeBlock}
          className="px-2 py-1 rounded border"
          style={{ backgroundColor: "#ffffff", color: "#121212" }}
          title="Insert Code Block"
        >
          Code Block
        </button>
      </div>
    </div>
  );
}

function EditorStateListener({ onChange }: { onChange: (payload: { text: string; json: any; html?: string }) => void }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        let json: any = null;
        let html: string | null = null;

        try {
          json = editorState.toJSON ? editorState.toJSON() : null;
        } catch (e) {
          json = null;
        }

        try {
          html = $generateHtmlFromNodes(editor);
        } catch (e) {
          html = null;
        }

        onChange({ text: text || "", json, html: html || undefined });
      });
    });
  }, [editor, onChange]);

  return null;
}
export default function LexicalEditorComplete({ onChange, placeholder }: Props) {
  const initialConfig = {
    namespace: "CreatePostEditor",
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HorizontalRuleNode,
    ],
    onError: (error: Error, editor: LexicalEditor) => {
      console.error(error);
    },
    theme: {
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        code: "bg-gray-200 font-mono text-sm px-1 rounded",
      },
      heading: {
        h1: "text-4xl font-bold mb-4",
        h2: "text-3xl font-bold mb-3",
        h3: "text-2xl font-bold mb-2",
        h4: "text-xl font-bold mb-2",
        h5: "text-lg font-bold mb-2",
        h6: "text-base font-bold mb-2",
      },
      list: {
        nested: {
          listitem: "list-item ml-4",
        },
        ol: "list-decimal list-inside",
        ul: "list-disc list-inside",
        listitem: "list-item",
      },
      link: "text-blue-600 underline cursor-pointer",
      quote: "border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2",
      code: "bg-gray-900 text-gray-100 font-mono p-4 rounded overflow-x-auto",
      codeHighlight: {
        atrule: "color: rgb(136, 19, 145)",
        attr: "color: rgb(153, 153, 153)",
        boolean: "color: rgb(136, 19, 145)",
        builtin: "color: rgb(6, 90, 143)",
        cdata: "color: rgb(107, 107, 107)",
        char: "color: rgb(206, 145, 120)",
        class: "color: rgb(255, 157, 167)",
        "class-name": "color: rgb(255, 157, 167)",
        comment: "color: rgb(107, 107, 107)",
        constant: "color: rgb(189, 16, 224)",
        deleted: "color: rgb(206, 145, 120)",
        doctype: "color: rgb(107, 107, 107)",
        entity: "color: rgb(206, 145, 120)",
        function: "color: rgb(6, 90, 143)",
        important: "color: rgb(188, 63, 60)",
        inserted: "color: rgb(19, 161, 14)",
        keyword: "color: rgb(136, 19, 145)",
        namespace: "color: rgb(255, 157, 167)",
        number: "color: rgb(189, 16, 224)",
        operator: "color: rgb(107, 107, 107)",
        prolog: "color: rgb(107, 107, 107)",
        property: "color: rgb(153, 153, 153)",
        pseudoclass: "color: rgb(206, 145, 120)",
        pseudoelement: "color: rgb(206, 145, 120)",
        punctuation: "color: rgb(107, 107, 107)",
        regex: "color: rgb(206, 145, 120)",
        selector: "color: rgb(206, 145, 120)",
        string: "color: rgb(19, 161, 14)",
        symbol: "color: rgb(189, 16, 224)",
        tag: "color: rgb(136, 19, 145)",
        unit: "color: rgb(189, 16, 224)",
        url: "color: rgb(206, 145, 120)",
        variable: "color: rgb(188, 63, 60)",
      },
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded-md overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        <Toolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[300px] p-4 outline-none resize-none overflow-hidden" style={{ color: "#121212", backgroundColor: "#ffffff" }} />
            }
            placeholder={
              placeholder ? (
                <div style={{ color: "#B7B6B6" }}>{placeholder}</div>
              ) : (
                <div className="absolute top-4 left-4 pointer-events-none" style={{ color: "#B7B6B6" }}>
                  Entre com o texto...
                </div>
              )
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin />
        <TabIndentationPlugin />
        <EditorStateListener onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}
