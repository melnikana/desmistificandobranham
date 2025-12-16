/**
 * Conversores entre Lexical e sistema de blocos
 */

import type { PostBlock, BlockType } from './types';
import { sanitizeBlockPayload } from './validators';

/**
 * Converte o estado JSON do Lexical em uma lista de blocos
 */
export function lexicalToBlocks(lexicalState: any): PostBlock[] {
  if (!lexicalState || !lexicalState.root || !lexicalState.root.children) {
    return [];
  }

  const blocks: Omit<PostBlock, 'id' | 'post_id' | 'created_at' | 'updated_at'>[] = [];
  const children = lexicalState.root.children;

  children.forEach((node: any, index: number) => {
    const block = lexicalNodeToBlock(node, index);
    if (block) {
      blocks.push(block);
    }
  });

  return blocks as PostBlock[];
}

/**
 * Converte um nó do Lexical em um bloco
 */
function lexicalNodeToBlock(
  node: any,
  position: number
): Omit<PostBlock, 'id' | 'post_id' | 'created_at' | 'updated_at'> | null {
  const nodeType = node.type;

  switch (nodeType) {
    case 'paragraph':
      return {
        type: 'text',
        position,
        payload: sanitizeBlockPayload('text', {
          lexicalState: node,
          text: extractTextFromNode(node),
          html: nodeToHtml(node),
        }),
      };

    case 'heading':
      const level = node.tag?.replace('h', '') || '1';
      return {
        type: 'heading',
        position,
        payload: sanitizeBlockPayload('heading', {
          level: parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6,
          lexicalState: node,
          text: extractTextFromNode(node),
          html: nodeToHtml(node),
        }),
      };

    case 'quote':
      return {
        type: 'quote',
        position,
        payload: sanitizeBlockPayload('quote', {
          lexicalState: node,
          text: extractTextFromNode(node),
          html: nodeToHtml(node),
        }),
      };

    case 'code':
      return {
        type: 'code_block',
        position,
        payload: sanitizeBlockPayload('code_block', {
          lexicalState: node,
          language: node.language || 'plaintext',
          text: extractTextFromNode(node),
          html: nodeToHtml(node),
        }),
      };

    case 'list':
      // Converter lista em bullet_list ou numbered_list
      if (node.listType === 'bullet') {
        return {
          type: 'bullet_list',
          position,
          payload: sanitizeBlockPayload('bullet_list', {
            lexicalState: node,
            text: extractTextFromNode(node),
            html: nodeToHtml(node),
          }),
        };
      } else if (node.listType === 'number') {
        return {
          type: 'numbered_list',
          position,
          payload: sanitizeBlockPayload('numbered_list', {
            lexicalState: node,
            text: extractTextFromNode(node),
            html: nodeToHtml(node),
          }),
        };
      }
      break;

    case 'horizontalrule':
      return {
        type: 'separator',
        position,
        payload: sanitizeBlockPayload('separator', {
          style: 'solid',
        }),
      };

    case 'image':
      // Verificar se é ImageNode customizado
      if (node.__type === 'image' || node.src) {
        return {
          type: 'image',
          position,
          payload: sanitizeBlockPayload('image', {
            url: node.src || node.url || '',
            alt: node.alt || '',
            caption: node.caption || '',
            width: node.width,
            height: node.height,
          }),
        };
      }
      break;

    case 'list':
      // Converter lista em parágrafos (simplificado)
      if (node.listType === 'bullet' || node.listType === 'number') {
        const listItems = node.children || [];
        return {
          type: 'rich_text',
          position,
          payload: sanitizeBlockPayload('rich_text', {
            lexicalState: node,
            text: extractTextFromNode(node),
            html: nodeToHtml(node),
          }),
        };
      }
      break;

    default:
      // Para outros tipos, tentar converter para text
      if (node.children && node.children.length > 0) {
        return {
          type: 'text',
          position,
          payload: sanitizeBlockPayload('text', {
            lexicalState: node,
            text: extractTextFromNode(node),
            html: nodeToHtml(node),
          }),
        };
      }
      break;
  }

  return null;
}

/**
 * Extrai texto plano de um nó do Lexical
 */
function extractTextFromNode(node: any): string {
  if (!node) return '';

  if (node.text) {
    return node.text;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children
      .map((child: any) => extractTextFromNode(child))
      .join('');
  }

  return '';
}

/**
 * Converte um nó do Lexical em HTML básico (simplificado)
 */
function nodeToHtml(node: any): string {
  if (!node) return '';

  const nodeType = node.type;

  switch (nodeType) {
    case 'paragraph':
      const pText = extractTextFromNode(node);
      return `<p>${escapeHtml(pText)}</p>`;

    case 'heading':
      const level = node.tag?.replace('h', '') || '1';
      const hText = extractTextFromNode(node);
      return `<h${level}>${escapeHtml(hText)}</h${level}>`;

    case 'quote':
      const qText = extractTextFromNode(node);
      return `<blockquote>${escapeHtml(qText)}</blockquote>`;

    case 'code':
      const codeText = extractTextFromNode(node);
      return `<pre><code>${escapeHtml(codeText)}</code></pre>`;

    case 'horizontalrule':
      return '<hr />';

    case 'image':
      const imgUrl = node.src || node.url || '';
      const imgAlt = node.alt || '';
      return `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(imgAlt)}" />`;

    default:
      const text = extractTextFromNode(node);
      return text ? `<p>${escapeHtml(text)}</p>` : '';
  }
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  // Fallback para server-side
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converte uma lista de blocos de volta para o formato Lexical (para compatibilidade)
 * Nota: Esta função é simplificada e pode não preservar toda a estrutura original
 */
export function blocksToLexical(blocks: PostBlock[]): any {
  const children = blocks
    .sort((a, b) => a.position - b.position)
    .map((block) => {
      if (block.type === 'rich_text' || block.type === 'heading' || block.type === 'quote' || block.type === 'code') {
        const payload = block.payload as any;
        return payload.lexicalState || null;
      }
      // Para blocos não-Lexical, criar nós simples
      if (block.type === 'separator') {
        return {
          type: 'horizontalrule',
          version: 1,
        };
      }
      if (block.type === 'image') {
        const payload = block.payload as any;
        return {
          type: 'image',
          src: payload.url,
          alt: payload.alt || '',
          version: 1,
        };
      }
      return null;
    })
    .filter((node) => node !== null);

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

