import { DecoratorNode, NodeKey, LexicalNode, SerializedLexicalNode, Spread, EditorConfig, $getRoot, $createParagraphNode, $parseSerializedNode } from 'lexical';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $getNodeByKey } from 'lexical';
import { Feather } from 'lucide-react';
import FloatingToolbarPlugin from '../FloatingToolbarPlugin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TranslationSource = 'recordings' | 'app-goiania';

export const TRANSLATION_SOURCES = {
  recordings: 'Gravações, a voz de Deus',
  'app-goiania': 'App. Busca - Goiânia',
};

type SerializedTranslationQuoteNode = Spread<
  {
    text: string;
    html?: string;
    editorState?: string;
    source: TranslationSource;
    isSaved?: boolean;
  },
  SerializedLexicalNode
>;

function TranslationQuoteComponent({
  text: initialText,
  html: initialHtml,
  editorState: initialEditorState,
  source: initialSource,
  isSaved: initialIsSaved,
  nodeKey,
}: {
  text: string;
  html?: string;
  editorState?: string;
  source: TranslationSource;
  isSaved: boolean;
  nodeKey: NodeKey;
}) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:TranslationQuoteComponent',message:'Component initialized',data:{initialIsSaved,initialText,initialHtml,hasEditorState:!!initialEditorState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  const [parentEditor] = useLexicalComposerContext();
  const [text, setText] = useState(initialText);
  const [html, setHtml] = useState(initialHtml || '');
  const [editorStateJSON, setEditorStateJSON] = useState(initialEditorState || '');
  const [source, setSource] = useState<TranslationSource>(initialSource);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const nestedEditorRef = useRef<any>(null);
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:TranslationQuoteComponent',message:'State initialized',data:{isSaved,text,html},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  const initialConfig = {
    namespace: 'TranslationQuoteEditor',
    editorState: editorStateJSON || undefined,
    onError: (error: Error) => {
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
    },
  };

  const handleSourceChange = useCallback((value: TranslationSource) => {
    setSource(value);
    parentEditor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && node instanceof TranslationQuoteNode) {
        node.setSource(value);
      }
    });
  }, [parentEditor, nodeKey]);

  const handleSave = useCallback(() => {
    if (nestedEditorRef.current) {
      const nestedEditor = nestedEditorRef.current;
      nestedEditor.getEditorState().read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        
        if (textContent.trim()) {
          let htmlContent = '';
          try {
            htmlContent = $generateHtmlFromNodes(nestedEditor);
          } catch (e) {
            console.error('Error generating HTML:', e);
          }

          const editorStateJSON = JSON.stringify(nestedEditor.getEditorState().toJSON());
          
          setText(textContent);
          setHtml(htmlContent);
          setEditorStateJSON(editorStateJSON);
          setIsSaved(true);
          
          parentEditor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node && node instanceof TranslationQuoteNode) {
              node.setText(textContent);
              node.setHtml(htmlContent);
              node.setEditorState(editorStateJSON);
              node.setSource(source);
              node.setIsSaved(true);
            }
          });
          
          // Chamar callback para criar novo bloco de parágrafo abaixo no HybridBlockEditor
          const saveFn = (window as any).__saveCitacaoBranham;
          if (saveFn) {
            // Aguardar um pouco para garantir que o estado foi atualizado
            setTimeout(() => {
              saveFn();
            }, 100);
          }
        }
      });
    }
  }, [source, parentEditor, nodeKey]);

  const handleEdit = useCallback(() => {
    setIsSaved(false);
    parentEditor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && node instanceof TranslationQuoteNode) {
        node.setIsSaved(false);
      }
    });
  }, [parentEditor, nodeKey]);

  const handleCancel = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:handleCancel',message:'handleCancel called',data:{isSaved},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const cancelFn = (window as any).__cancelCitacaoBranham;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:handleCancel',message:'Checking cancelFn',data:{cancelFnExists:!!cancelFn,typeofCancelFn:typeof cancelFn},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (cancelFn) {
      // Se há função de cancelamento global (bloco criado via botão +), usar ela para deletar o bloco
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:handleCancel',message:'Calling cancelFn to delete block',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      cancelFn();
    } else {
      // Se não há função global (bloco criado via comando /), remover o nó diretamente do Lexical
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:handleCancel',message:'No cancelFn, removing node from Lexical',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      parentEditor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node) {
          // Remover o nó e inserir um parágrafo vazio no lugar
          const paragraphNode = $createParagraphNode();
          node.replace(paragraphNode);
          paragraphNode.selectEnd();
        }
      });
    }
  }, [isSaved, parentEditor, nodeKey]);

  // Adicionar handler para ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaved) {
        handleCancel();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSaved, handleCancel]);

  // Verificar se a função global está disponível periodicamente (apenas em modo edição)
  React.useEffect(() => {
    if (!isSaved) {
      const checkInterval = setInterval(() => {
        const cancelFn = (window as any).__cancelCitacaoBranham;
        const saveFn = (window as any).__saveCitacaoBranham;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:checkInterval',message:'Periodic check for global functions',data:{hasCancelFn:!!cancelFn,hasSaveFn:!!saveFn,isSaved},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }, 500);
      return () => clearInterval(checkInterval);
    }
  }, [isSaved]);

  // Modo Salvo (visualização limpa) - imutável
  if (isSaved && text.trim()) {
    const sourceText = TRANSLATION_SOURCES[source];
    return (
      <div 
        className="my-4 group cursor-pointer translation-quote-node-saved"
        contentEditable={false}
        data-lexical-decorator="true"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEdit();
        }}
      >
        <div 
          className="translation-quote-content-text"
          dangerouslySetInnerHTML={{ __html: html || text }}
        />
        <div className="translation-quote-footer">
          Fonte: {sourceText}
        </div>
      </div>
    );
  }

  // Modo Edição
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="my-4 border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Cabeçalho */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
          <Feather className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Citação Branham</span>
        </div>

        {/* Conteúdo com Editor Rico */}
        <div className="p-4 relative">
          <EditorRefPlugin editorRef={nestedEditorRef} />
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="w-full min-h-[120px] p-3 bg-[#F8F4EB] text-[#323232] text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 outline-none"
                style={{ fontFamily: "var(--font-space-mono), 'Space Mono', ui-monospace, monospace" }}
              />
            }
            placeholder={
              <div 
                className="absolute top-7 left-7 text-gray-400 pointer-events-none text-sm"
                style={{ fontFamily: "var(--font-space-mono), 'Space Mono', ui-monospace, monospace" }}
              >
                Digite a citação aqui...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <FloatingToolbarPlugin />
        </div>

        {/* Rodapé com Seletor e Botões Salvar/Cancelar */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-600">Fonte:</span>
              <Select value={source} onValueChange={handleSourceChange}>
                <SelectTrigger className="w-[280px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recordings">
                    {TRANSLATION_SOURCES.recordings}
                  </SelectItem>
                  <SelectItem value="app-goiania">
                    {TRANSLATION_SOURCES['app-goiania']}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:CancelButton',message:'Cancel button clicked',data:{isSaved},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
                  // #endregion
                  handleCancel();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Excluir
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </LexicalComposer>
  );
}

// Plugin para obter referência do editor aninhado
function EditorRefPlugin({ editorRef }: { editorRef: React.MutableRefObject<any> }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);
  
  return null;
}

export class TranslationQuoteNode extends DecoratorNode<JSX.Element> {
  __text: string;
  __html: string;
  __editorState: string;
  __source: TranslationSource;
  __isSaved: boolean;

  static getType(): string {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:getType',message:'getType called',data:{returnType:'translation-quote',className:TranslationQuoteNode.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return 'translation-quote';
  }

  static getStaticType(): string {
    return 'translation-quote';
  }

  static clone(node: TranslationQuoteNode): TranslationQuoteNode {
    const cloned = new TranslationQuoteNode(node.__text, node.__source, node.__key);
    cloned.__html = node.__html;
    cloned.__editorState = node.__editorState;
    cloned.__isSaved = node.__isSaved;
    return cloned;
  }

  constructor(text: string = '', source: TranslationSource = 'recordings', key?: NodeKey) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:constructor',message:'TranslationQuoteNode constructor called',data:{text,source,hasKey:!!key,nodeType:TranslationQuoteNode.getType()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    super(key);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:constructor',message:'After super(key) call',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    this.__text = text;
    this.__html = '';
    this.__editorState = '';
    this.__source = source;
    this.__isSaved = false; // Sempre começa em modo de edição
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'translation-quote-node';
    div.style.display = 'block';
    div.style.userSelect = 'none';
    return div;
  }

  updateDOM(): false {
    return false;
  }
  
  isInline(): boolean {
    return false;
  }

  setText(text: string): void {
    const writable = this.getWritable();
    writable.__text = text;
  }

  setHtml(html: string): void {
    const writable = this.getWritable();
    writable.__html = html;
  }

  setEditorState(editorState: string): void {
    const writable = this.getWritable();
    writable.__editorState = editorState;
  }

  setSource(source: TranslationSource): void {
    const writable = this.getWritable();
    writable.__source = source;
  }

  setIsSaved(isSaved: boolean): void {
    const writable = this.getWritable();
    writable.__isSaved = isSaved;
  }

  getText(): string {
    return this.__text;
  }

  getHtml(): string {
    return this.__html;
  }

  getEditorState(): string {
    return this.__editorState;
  }

  getSource(): TranslationSource {
    return this.__source;
  }

  getIsSaved(): boolean {
    return this.__isSaved;
  }

  // Gera HTML completo com wrapper para preview
  getHtmlForPreview(): string {
    if (!this.__isSaved || !this.__html.trim()) {
      return '';
    }
    const sourceText = TRANSLATION_SOURCES[this.__source];
    return `<div class="translation-quote-node-saved" style="background-color: #F8F4EB; color: #323232; font-family: 'Space Mono', ui-monospace, monospace; padding: 0.75rem; border-radius: 6px; margin: 1rem 0; line-height: 1.6; font-size: 0.875rem;">
  <div class="translation-quote-content-text" style="margin-bottom: 0.5rem;">
    ${this.__html}
  </div>
  <div class="translation-quote-footer" style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem;">
    Fonte: ${sourceText}
  </div>
</div>`;
  }

  decorate(): JSX.Element {
    return (
      <TranslationQuoteComponent
        text={this.__text}
        html={this.__html}
        editorState={this.__editorState}
        source={this.__source}
        isSaved={this.__isSaved}
        nodeKey={this.__key}
      />
    );
  }

  static importJSON(serializedNode: SerializedTranslationQuoteNode): TranslationQuoteNode {
    // Criar o nó diretamente para evitar recursão com $createTranslationQuoteNode
    const node = new TranslationQuoteNode(serializedNode.text || '', serializedNode.source || 'recordings');
    if (serializedNode.html) {
      node.__html = serializedNode.html;
    }
    if (serializedNode.editorState) {
      node.__editorState = serializedNode.editorState;
    }
    if (serializedNode.isSaved !== undefined) {
      node.__isSaved = serializedNode.isSaved;
    }
    return node;
  }

  exportJSON(): SerializedTranslationQuoteNode {
    return {
      text: this.__text,
      html: this.__html,
      editorState: this.__editorState,
      source: this.__source,
      isSaved: this.__isSaved,
      type: 'translation-quote',
      version: 1,
    };
  }
}

export function $createTranslationQuoteNode(
  text: string = '',
  source: TranslationSource = 'recordings'
): TranslationQuoteNode {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:$createTranslationQuoteNode',message:'$createTranslationQuoteNode called',data:{text,source,nodeType:TranslationQuoteNode.getType()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  try {
    // Usar $parseSerializedNode para criar o nó, que usa a classe registrada no editor
    // Isso evita problemas com hot reload do Next.js
    const serializedNode: SerializedTranslationQuoteNode = {
      type: 'translation-quote',
      text,
      source,
      isSaved: false,
      version: 1,
    };
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:$createTranslationQuoteNode',message:'Using $parseSerializedNode to create node',data:{serializedNode,hasParseSerializedNode:typeof $parseSerializedNode === 'function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const node = $parseSerializedNode(serializedNode) as TranslationQuoteNode;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:$createTranslationQuoteNode',message:'Node created successfully via $parseSerializedNode',data:{nodeType:node.getType(),nodeKey:node.getKey(),isInstanceOf:node instanceof TranslationQuoteNode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return node;
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranslationQuoteNode.tsx:$createTranslationQuoteNode',message:'Error creating node',data:{errorMessage:error?.message,errorStack:error?.stack,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    throw error;
  }
}

export function $isTranslationQuoteNode(
  node: LexicalNode | null | undefined
): node is TranslationQuoteNode {
  return node instanceof TranslationQuoteNode;
}

