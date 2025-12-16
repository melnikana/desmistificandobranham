"use client";

import React from "react";
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
import { $getRoot, LexicalEditor } from "lexical";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { $generateHtmlFromNodes } from "@lexical/html";
import { ImageNode } from "@/components/editor/nodes/ImageNode";
import { YouTubeNode } from "@/components/editor/nodes/YouTubeNode";
import { ColumnsNode } from "@/components/editor/nodes/ColumnsNode";
import { GifNode } from "@/components/editor/nodes/GifNode";
import { TranslationQuoteNode } from "@/components/editor/nodes/TranslationQuoteNode";
import FloatingToolbarPlugin from "@/components/editor/FloatingToolbarPlugin";
import SlashCommandPlugin from "@/components/editor/SlashCommandPlugin";
import QuoteEnterPlugin from "@/components/editor/QuoteEnterPlugin";
import PlusButtonPlugin from "@/components/editor/PlusButtonPlugin";
import HorizontalRuleTransformPlugin from "@/components/editor/HorizontalRuleTransformPlugin";

type Props = {
  onChange: (payload: { text: string; json: any; html?: string }) => void;
  placeholder?: React.ReactNode;
  initialContent?: string; // JSON string of editor state
};

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
          
          // Adicionar HTML dos TranslationQuoteNodes salvos
          const children = root.getChildren();
          const translationQuoteHtmlParts: string[] = [];
          
          children.forEach((node) => {
            if (node instanceof TranslationQuoteNode && node.getIsSaved()) {
              const nodeHtml = node.getHtmlForPreview();
              if (nodeHtml) {
                translationQuoteHtmlParts.push(nodeHtml);
              }
            }
          });
          
          // Adicionar os blocos TranslationQuote ao final do HTML
          if (translationQuoteHtmlParts.length > 0) {
            html = (html || '') + '\n' + translationQuoteHtmlParts.join('\n');
          }
        } catch (e) {
          html = null;
        }

        onChange({ text: text || "", json, html: html || undefined });
      });
    });
  }, [editor, onChange]);

  return null;
}
export default function LexicalEditorComplete({ onChange, placeholder, initialContent }: Props) {
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LexicalEditorComplete.tsx:component',message:'LexicalEditorComplete rendering',data:{hasTranslationQuoteNode:!!TranslationQuoteNode,nodeType:TranslationQuoteNode?.getType?.(),nodeName:TranslationQuoteNode?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  }, []);
  // #endregion
  
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
      ImageNode,
      YouTubeNode,
      ColumnsNode,
      GifNode,
      TranslationQuoteNode,
    ],
    editorState: initialContent || undefined,
    onError: (error: Error, editor: LexicalEditor) => {
      console.error(error);
    },
    theme: {
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        code: "bg-code-highlight",
      },
      code: "code-block-custom",
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
      quote: "border-l-2 pl-4 italic my-2 blockquote-custom",
      horizontalRule: "horizontal-rule-custom",
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
        <div className="relative lexical-editor-custom">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[500px] py-4 outline-none resize-none" 
                style={{ 
                  paddingLeft: '0',
                  paddingRight: '32px',
                  color: "#37352F", 
                  fontSize: "16px",
                  lineHeight: "1.5"
                }} 
              />
            }
            placeholder={
              placeholder ? (
                <div className="absolute top-4 left-0 pointer-events-none text-gray-400">
                  {placeholder}
                </div>
              ) : (
                <div className="absolute top-4 left-0 pointer-events-none text-gray-400">
                  Digite '/' para comandos...
                </div>
              )
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin />
          <TabIndentationPlugin />
          <QuoteEnterPlugin />
          <HorizontalRuleTransformPlugin />
          <PlusButtonPlugin />
          <FloatingToolbarPlugin />
          <SlashCommandPlugin />
          <EditorStateListener onChange={onChange} />
        </div>
    </LexicalComposer>
  );
}
