"use client";

import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  TextFormatType,
  ElementFormatType,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";

type Props = {
  onChange: (payload: { text: string; json: any; html?: string }) => void;
  placeholder?: React.ReactNode;
};

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  function applyHeading(tag: string) {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, tag as ElementFormatType);
  }

  function toggleFormat(format: string) {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as TextFormatType);
  }

  function insertList(ordered: boolean) {
    editor.dispatchCommand(ordered ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND, undefined);
  }

  function doUndo() {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }

  function doRedo() {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }

  function indent() {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  }

  function outdent() {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  }

  function insertLink() {
    const url = window.prompt("URL do link:");
    if (!url) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  }

  return (
    <div className="flex gap-2 mb-2 flex-wrap">
      <div className="flex gap-1">
        <button onClick={() => applyHeading("p")} className="px-2 py-1 border rounded">Normal</button>
        <button onClick={() => applyHeading("h1")} className="px-2 py-1 border rounded">H1</button>
        <button onClick={() => applyHeading("h2")} className="px-2 py-1 border rounded">H2</button>
        <button onClick={() => applyHeading("h3")} className="px-2 py-1 border rounded">H3</button>
        <button onClick={() => applyHeading("h4")} className="px-2 py-1 border rounded">H4</button>
        <button onClick={() => applyHeading("h5")} className="px-2 py-1 border rounded">H5</button>
        <button onClick={() => applyHeading("h6")} className="px-2 py-1 border rounded">H6</button>
      </div>

      <div className="flex gap-1">
        <button onClick={() => toggleFormat("bold")} className="px-2 py-1 border rounded">B</button>
        <button onClick={() => toggleFormat("italic")} className="px-2 py-1 border rounded">I</button>
        <button onClick={() => toggleFormat("underline")} className="px-2 py-1 border rounded">U</button>
        <button onClick={() => toggleFormat("strikethrough")} className="px-2 py-1 border rounded">S</button>
        <button onClick={() => toggleFormat("code")} className="px-2 py-1 border rounded">Code</button>
      </div>

      <div className="flex gap-1">
        <button onClick={() => insertList(false)} className="px-2 py-1 border rounded">• List</button>
        <button onClick={() => insertList(true)} className="px-2 py-1 border rounded">1. List</button>
        <button onClick={indent} className="px-2 py-1 border rounded">Indent</button>
        <button onClick={outdent} className="px-2 py-1 border rounded">Outdent</button>
      </div>

      <div className="flex gap-1">
        <button onClick={insertLink} className="px-2 py-1 border rounded">Link</button>
        <button onClick={doUndo} className="px-2 py-1 border rounded">Undo</button>
        <button onClick={doRedo} className="px-2 py-1 border rounded">Redo</button>
      </div>
    </div>
  );
}

function EditorChangeHandler({ onChange }: { onChange: (payload: { text: string; json: any; html?: string }) => void }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    const remove = editor.registerUpdateListener(({ editorState }) => {
      try {
        editorState.read(() => {
          const root = $getRoot();
          // @ts-ignore
          const text = root.getTextContent();
          let json: any = null;
          try {
            // @ts-ignore
            json = editorState.toJSON ? editorState.toJSON() : null;
          } catch (e) {
            json = null;
          }

          let html = null;
          try {
            // Generate rich HTML using @lexical/html
            // @ts-ignore
            html = $generateHtmlFromNodes(editor);
          } catch (e) {
            html = null;
          }

          onChange({ text: text || "", json, html: html ?? undefined });
        });
      } catch (e) {
        console.error(e);
      }
    });

    return () => {
      remove();
    };
  }, [editor, onChange]);

  return null;
}

export default function CreatePostEditor({ onChange, placeholder }: Props) {
  const initialConfig = {
    namespace: "CreatePostEditor",
    nodes: [LinkNode],
    onError(error: Error) {
      console.error(error);
    },
  } as any;

  function handleChange(editorState: any) {
    try {
      let text = "";
      let json: any = null;
      editorState.read(() => {
        const root = $getRoot();
        // @ts-ignore
        text = root.getTextContent();
        try {
          // EditorState may provide toJSON
          // @ts-ignore
          if (typeof editorState.toJSON === "function") {
            // @ts-ignore
            json = editorState.toJSON();
          }
        } catch (e) {
          json = null;
        }
      });

      // Basic HTML conversion: escape and wrap lines in <p>
      function escapeHtml(s: string) {
        return s
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }
      const html = text
        .split(/\n{2,}/)
        .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
        .join("\n");

      onChange({ text, json, html });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div>
        <div className="border rounded-md p-2 bg-white dark:bg-gray-800">
          <RichTextPlugin
            contentEditable={<ContentEditable className="min-h-[200px] p-2 outline-none" />}
            placeholder={placeholder ? <div>{placeholder}</div> : <div className="text-gray-400">Escreva o conteúdo aqui...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LinkPlugin />
          <EditorChangeHandler onChange={handleChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}
