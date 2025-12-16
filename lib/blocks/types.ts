/**
 * Tipos para o sistema de blocos
 */

export type BlockType = 
  // Blocos que USAM Lexical (texto rico)
  | 'text'                  // Parágrafo normal (usa Lexical)
  | 'heading'               // Título H1-H6 (usa Lexical)
  | 'bullet_list'           // Lista com marcadores (usa Lexical)
  | 'numbered_list'         // Lista numerada (usa Lexical)
  | 'quote'                 // Citação simples (usa Lexical)
  | 'code_block'            // Bloco de código (usa Lexical)
  // Blocos que NÃO usam Lexical
  | 'separator'             // Linha divisória
  | 'image'                 // Imagem (upload via Supabase Storage)
  | 'gif'                   // GIF
  | 'youtube_video'         // Embed YouTube
  | 'table'                 // Tabela
  // Blocos Container (armazenam outros blocos)
  | 'columns-2'             // Layout em 2 colunas (container)
  | 'collapsible_container' // Seção recolhível (container)
  // Bloco customizado
  | 'citacao_branham';      // Citação Branham com estrutura própria

/**
 * Blocos que USAM Lexical (texto rico)
 */
export type LexicalBlockType = 'text' | 'heading' | 'bullet_list' | 'numbered_list' | 'quote' | 'code_block' | 'citacao_branham';

/**
 * Blocos que NÃO USAM Lexical
 */
export type NonLexicalBlockType = 'separator' | 'image' | 'gif' | 'youtube_video' | 'table';

/**
 * Blocos Container (armazenam outros blocos no payload)
 */
export type ContainerBlockType = 'columns-2' | 'collapsible_container';

/**
 * Payload base para blocos que usam Lexical
 */
export interface LexicalBlockPayload {
  lexicalState: any; // JSON do estado do Lexical
  html?: string;     // HTML gerado
  text?: string;     // Texto plano extraído
}

/**
 * Payload para text (parágrafo normal - usa Lexical)
 */
export interface TextBlockPayload extends LexicalBlockPayload {}

/**
 * Payload para heading (usa Lexical)
 */
export interface HeadingBlockPayload extends LexicalBlockPayload {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Payload para bullet_list (usa Lexical)
 */
export interface BulletListBlockPayload extends LexicalBlockPayload {}

/**
 * Payload para numbered_list (usa Lexical)
 */
export interface NumberedListBlockPayload extends LexicalBlockPayload {}

/**
 * Payload para quote (usa Lexical)
 */
export interface QuoteBlockPayload extends LexicalBlockPayload {}

/**
 * Payload para code_block (usa Lexical)
 */
export interface CodeBlockPayload extends LexicalBlockPayload {
  language?: string;
}

/**
 * Payload para image (NÃO usa Lexical)
 */
export interface ImageBlockPayload {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

/**
 * Payload para separator (NÃO usa Lexical)
 */
export interface SeparatorBlockPayload {
  style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Payload para gif (NÃO usa Lexical)
 */
export interface GifBlockPayload {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Payload para youtube_video (NÃO usa Lexical)
 */
export interface YouTubeVideoBlockPayload {
  videoId: string;
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

/**
 * Payload para table (NÃO usa Lexical)
 */
export interface TableBlockPayload {
  rows: TableRow[];
  columns?: number;
  headers?: boolean;
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableCell {
  content: string;
  colspan?: number;
  rowspan?: number;
}

/**
 * Payload para columns-2 (container de blocos)
 */
export interface Columns2BlockPayload {
  children: PostBlock[]; // Blocos filhos
}

/**
 * Payload para collapsible_container (container de blocos)
 */
export interface CollapsibleContainerBlockPayload {
  title: string;
  children: PostBlock[]; // Blocos filhos
  collapsed?: boolean;
}

/**
 * Payload para citacao_branham (usa Lexical com TranslationQuoteNode)
 */
export interface CitacaoBranhamBlockPayload extends LexicalBlockPayload {
  text: string;
  source: string;
  translation?: string;
}

/**
 * Union type de todos os payloads
 */
export type BlockPayload = 
  // Blocos Lexical
  | TextBlockPayload
  | HeadingBlockPayload
  | BulletListBlockPayload
  | NumberedListBlockPayload
  | QuoteBlockPayload
  | CodeBlockPayload
  | CitacaoBranhamBlockPayload
  // Blocos Não-Lexical
  | SeparatorBlockPayload
  | ImageBlockPayload
  | GifBlockPayload
  | YouTubeVideoBlockPayload
  | TableBlockPayload
  // Blocos Container
  | Columns2BlockPayload
  | CollapsibleContainerBlockPayload;

/**
 * Estrutura de um bloco
 */
export interface PostBlock {
  id: string;
  post_id: string;
  type: BlockType;
  position: number;
  payload: BlockPayload;
  created_at?: string;
  updated_at?: string;
}

/**
 * Estrutura de um post com blocos
 */
export interface PostWithBlocks {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  featured_image_url?: string | null;
  author_id?: string;
  publish_date?: string;
  categories?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  blocks?: PostBlock[];
}

/**
 * Dados para criar um novo bloco
 */
export interface CreateBlockData {
  type: BlockType;
  position: number;
  payload: BlockPayload;
}

/**
 * Dados para atualizar um bloco
 */
export interface UpdateBlockData {
  type?: BlockType;
  position?: number;
  payload?: BlockPayload;
}

/**
 * Dados para reordenar blocos
 */
export interface ReorderBlocksData {
  blockIds: string[]; // IDs na nova ordem
}

