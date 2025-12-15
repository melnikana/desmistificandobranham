"use client";

import React, { useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { $generateHtmlFromNodes } from "@lexical/html";

import ToolbarPlugin from "./ToolbarPlugin";
import BlockControlsPlugin from "./BlockControlsPlugin";
import ImagePlugin from "./ImagePlugin";

// Nodes
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";

import type { LexicalEditor } from "lexical";

type Props = {
  onChange?: (payload: { text: string; json: any; html?: string }) => void;
  initialJSON?: any;
};

const editorConfig = {
  namespace: "EditorPlayground",
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
  onError: (error: Error, _editor: LexicalEditor) => {
    console.error(error);
  },
  theme: {
    paragraph: "text-base leading-7",
  },
};

export default function Editor({ onChange, initialJSON }: Props) {
  const handleChange = useCallback(
    (editorState: any) => {
      try {
        const json = editorState;
        // html generation handled in OnChange plugin read
        onChange && onChange({ text: json?.root?.children?.map((c: any) => c.text || "").join("\n") || "", json });
      } catch (e) {
        console.error(e);
      }
    },
    [onChange]
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-root">
        <ToolbarPlugin />
        <div className="editor-content bg-white rounded-b-lg p-4 min-h-[360px]">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input outline-none min-h-[300px]" />}
            placeholder={<div className="text-gray-400">Entre com o texto...</div>}
            ErrorBoundary={() => null}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin />
          <TabIndentationPlugin />
          <OnChangePlugin onChange={handleChange} />
          <ImagePlugin />
          <BlockControlsPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
