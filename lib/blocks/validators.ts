/**
 * Validadores para blocos
 */

import type {
  BlockType,
  BlockPayload,
  LexicalBlockPayload,
  TextBlockPayload,
  HeadingBlockPayload,
  BulletListBlockPayload,
  NumberedListBlockPayload,
  QuoteBlockPayload,
  CodeBlockPayload,
  ImageBlockPayload,
  SeparatorBlockPayload,
  GifBlockPayload,
  YouTubeVideoBlockPayload,
  TableBlockPayload,
  Columns2BlockPayload,
  CollapsibleContainerBlockPayload,
  CitacaoBranhamBlockPayload,
  PostBlock,
} from './types';

/**
 * Valida se o payload é válido para o tipo de bloco
 */
export function validateBlockPayload(type: BlockType, payload: any): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  switch (type) {
    // Blocos Lexical
    case 'text':
    case 'bullet_list':
    case 'numbered_list':
    case 'quote':
      return validateLexicalPayload(payload);
    
    case 'heading':
      return validateHeadingPayload(payload);
    
    case 'code_block':
      return validateCodeBlockPayload(payload);
    
    // Blocos Não-Lexical
    case 'image':
      return validateImagePayload(payload);
    
    case 'separator':
      return validateSeparatorPayload(payload);
    
    case 'gif':
      return validateGifPayload(payload);
    
    case 'youtube_video':
      return validateYouTubeVideoPayload(payload);
    
    case 'table':
      return validateTablePayload(payload);
    
    // Blocos Container
    case 'columns-2':
      return validateColumns2Payload(payload);
    
    case 'collapsible_container':
      return validateCollapsibleContainerPayload(payload);
    
    // Bloco Customizado
    case 'citacao_branham':
      return validateCitacaoBranhamPayload(payload);
    
    default:
      return false;
  }
}

function validateLexicalPayload(payload: any): payload is LexicalBlockPayload {
  return (
    payload.lexicalState !== undefined &&
    typeof payload.lexicalState === 'object'
  );
}

function validateHeadingPayload(payload: any): payload is HeadingBlockPayload {
  return (
    validateLexicalPayload(payload) &&
    typeof payload.level === 'number' &&
    payload.level >= 1 &&
    payload.level <= 6
  );
}

function validateCodeBlockPayload(payload: any): payload is CodeBlockPayload {
  return (
    validateLexicalPayload(payload) &&
    (payload.language === undefined || typeof payload.language === 'string')
  );
}

function validateImagePayload(payload: any): payload is ImageBlockPayload {
  return (
    typeof payload.url === 'string' &&
    payload.url.length > 0 &&
    (payload.alt === undefined || typeof payload.alt === 'string') &&
    (payload.caption === undefined || typeof payload.caption === 'string') &&
    (payload.width === undefined || typeof payload.width === 'number') &&
    (payload.height === undefined || typeof payload.height === 'number')
  );
}

function validateSeparatorPayload(payload: any): payload is SeparatorBlockPayload {
  return (
    payload.style === undefined ||
    ['solid', 'dashed', 'dotted'].includes(payload.style)
  );
}

function validateGifPayload(payload: any): payload is GifBlockPayload {
  return (
    typeof payload.url === 'string' &&
    payload.url.length > 0 &&
    (payload.alt === undefined || typeof payload.alt === 'string') &&
    (payload.width === undefined || typeof payload.width === 'number') &&
    (payload.height === undefined || typeof payload.height === 'number')
  );
}

function validateYouTubeVideoPayload(payload: any): payload is YouTubeVideoBlockPayload {
  return (
    typeof payload.videoId === 'string' &&
    payload.videoId.length > 0 &&
    typeof payload.url === 'string' &&
    payload.url.length > 0 &&
    (payload.thumbnail === undefined || typeof payload.thumbnail === 'string') &&
    (payload.width === undefined || typeof payload.width === 'number') &&
    (payload.height === undefined || typeof payload.height === 'number')
  );
}

function validateTablePayload(payload: any): payload is TableBlockPayload {
  return (
    Array.isArray(payload.rows) &&
    payload.rows.every((row: any) => 
      Array.isArray(row.cells) &&
      row.cells.every((cell: any) => typeof cell.content === 'string')
    ) &&
    (payload.columns === undefined || typeof payload.columns === 'number') &&
    (payload.headers === undefined || typeof payload.headers === 'boolean')
  );
}

function validateColumns2Payload(payload: any): payload is Columns2BlockPayload {
  return (
    Array.isArray(payload.children) &&
    payload.children.every((child: any) => 
      typeof child === 'object' &&
      child !== null &&
      typeof child.type === 'string' &&
      typeof child.position === 'number'
    )
  );
}

function validateCollapsibleContainerPayload(payload: any): payload is CollapsibleContainerBlockPayload {
  return (
    typeof payload.title === 'string' &&
    Array.isArray(payload.children) &&
    payload.children.every((child: any) => 
      typeof child === 'object' &&
      child !== null &&
      typeof child.type === 'string' &&
      typeof child.position === 'number'
    ) &&
    (payload.collapsed === undefined || typeof payload.collapsed === 'boolean')
  );
}

function validateCitacaoBranhamPayload(payload: any): payload is CitacaoBranhamBlockPayload {
  return (
    typeof payload.text === 'string' &&
    typeof payload.source === 'string' &&
    (payload.translation === undefined || typeof payload.translation === 'string') &&
    typeof payload.lexicalState === 'object' &&
    payload.lexicalState !== null &&
    payload.lexicalState.root &&
    (payload.html === undefined || typeof payload.html === 'string')
  );
}

/**
 * Sanitiza o payload removendo campos inválidos
 */
export function sanitizeBlockPayload(type: BlockType, payload: any): BlockPayload {
  switch (type) {
    // Blocos Lexical
    case 'text':
    case 'bullet_list':
    case 'numbered_list':
    case 'quote':
      // Garantir que lexicalState seja um objeto válido do Lexical
      const defaultLexicalState = {
        root: {
          children: [
            {
              children: [],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1
        }
      };
      return {
        lexicalState: (payload.lexicalState && typeof payload.lexicalState === 'object' && payload.lexicalState.root) 
          ? payload.lexicalState 
          : defaultLexicalState,
        html: payload.html,
        text: payload.text,
      };
    
    case 'heading':
      const defaultHeadingLexicalState = {
        root: {
          children: [
            {
              children: [],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "heading",
              version: 1,
              tag: `h${Math.max(1, Math.min(6, payload.level || 1))}`
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1
        }
      };
      return {
        level: Math.max(1, Math.min(6, payload.level || 1)) as 1 | 2 | 3 | 4 | 5 | 6,
        lexicalState: (payload.lexicalState && typeof payload.lexicalState === 'object' && payload.lexicalState.root) 
          ? payload.lexicalState 
          : defaultHeadingLexicalState,
        html: payload.html,
        text: payload.text,
      };
    
    case 'code_block':
      const defaultCodeLexicalState = {
        root: {
          children: [
            {
              children: [],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "code",
              version: 1,
              language: payload.language || 'plaintext'
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1
        }
      };
      return {
        lexicalState: (payload.lexicalState && typeof payload.lexicalState === 'object' && payload.lexicalState.root) 
          ? payload.lexicalState 
          : defaultCodeLexicalState,
        language: payload.language || 'plaintext',
        html: payload.html,
        text: payload.text,
      };
    
    // Blocos Não-Lexical
    case 'image':
      return {
        url: payload.url || '',
        alt: payload.alt,
        caption: payload.caption,
        width: payload.width,
        height: payload.height,
      };
    
    case 'separator':
      return {
        style: ['solid', 'dashed', 'dotted'].includes(payload.style) 
          ? payload.style 
          : 'solid',
      };
    
    case 'gif':
      return {
        url: payload.url || '',
        alt: payload.alt,
        width: payload.width,
        height: payload.height,
      };
    
    case 'youtube_video':
      return {
        videoId: payload.videoId || '',
        url: payload.url || '',
        thumbnail: payload.thumbnail,
        width: payload.width,
        height: payload.height,
      };
    
    case 'table':
      return {
        rows: Array.isArray(payload.rows) ? payload.rows : [],
        columns: typeof payload.columns === 'number' ? payload.columns : undefined,
        headers: typeof payload.headers === 'boolean' ? payload.headers : false,
      };
    
    // Blocos Container
    case 'columns-2':
      return {
        children: Array.isArray(payload.children) ? payload.children : [],
      };
    
    case 'collapsible_container':
      return {
        title: payload.title || '',
        children: Array.isArray(payload.children) ? payload.children : [],
        collapsed: typeof payload.collapsed === 'boolean' ? payload.collapsed : false,
      };
    
    // Bloco Customizado (usa Lexical com TranslationQuoteNode)
    case 'citacao_branham':
      const defaultCitacaoLexicalState = {
        root: {
          children: [{
            type: "translation-quote",
            text: payload.text || "",
            source: payload.source || "recordings",
            isSaved: false,
            version: 1
          }],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1
        }
      };
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c063ddf-e9b7-420f-9ec3-100468228a21',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'validators.ts:sanitizeBlockPayload',message:'sanitizeBlockPayload citacao_branham',data:{hasLexicalState:!!payload.lexicalState,payloadText:payload.text,payloadHtml:payload.html},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      return {
        lexicalState: (payload.lexicalState && typeof payload.lexicalState === 'object' && payload.lexicalState.root) 
          ? payload.lexicalState 
          : defaultCitacaoLexicalState,
        html: payload.html,
        text: payload.text || '',
        source: payload.source || 'recordings',
        translation: payload.translation,
      };
    
    default:
      throw new Error(`Tipo de bloco inválido: ${type}`);
  }
}

