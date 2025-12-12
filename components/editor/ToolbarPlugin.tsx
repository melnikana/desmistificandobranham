"use client";

import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  TextFormatType,
  ElementFormatType,
} from "lexical";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const setHeading = (level: string) => {
    if (level === "p") editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "p" as ElementFormatType);
    else editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, level as ElementFormatType);
  };

  const toggleFormat = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className="toolbar flex gap-2 p-3 bg-gray-100 rounded-t-lg border-b">
      <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} className="px-2 py-1 bg-white rounded">↶</button>
      <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} className="px-2 py-1 bg-white rounded">↷</button>

      <select onChange={(e) => setHeading(e.target.value)} className="px-2 py-1 bg-white rounded border mx-2">
        <option value="p">Normal</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
      </select>

      <button onClick={() => toggleFormat("bold")} className="px-2 py-1 bg-white rounded">B</button>
      <button onClick={() => toggleFormat("italic")} className="px-2 py-1 bg-white rounded">I</button>
      <button onClick={() => toggleFormat("underline")} className="px-2 py-1 bg-white rounded">U</button>
      <button onClick={() => toggleFormat("strikethrough")} className="px-2 py-1 bg-white rounded">S</button>

      <button onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)} className="px-2 py-1 bg-white rounded">&gt;&gt;</button>
      <button onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)} className="px-2 py-1 bg-white rounded">&lt;&lt;</button>
    </div>
  );
}
