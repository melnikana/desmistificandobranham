"use client";

import React from 'react';
import type { PostBlock } from '@/lib/blocks/types';

interface BlockRendererProps {
  block: PostBlock;
  mode?: 'view' | 'edit';
  onUpdate?: (blockId: string, payload: any) => void;
}

/**
 * Renderiza um bloco baseado no seu tipo
 */
export default function BlockRendererComponent({ block, mode = 'view', onUpdate }: BlockRendererProps) {
  const { type, payload } = block;

  switch (type) {
    // Blocos Lexical
    case 'text':
    case 'bullet_list':
    case 'numbered_list':
    case 'quote':
    case 'code_block': {
      const lexicalPayload = payload as any;
      if (mode === 'edit') {
        // Em modo edit, o BlockEditor já renderiza o editor apropriado
        return null;
      }
      // View mode
      return (
        <div
          className="block-content"
          dangerouslySetInnerHTML={{ __html: lexicalPayload.html || lexicalPayload.text || '' }}
        />
      );
    }

    case 'heading': {
      const headingPayload = payload as any;
      const level = headingPayload.level || 1;
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      
      if (mode === 'edit') {
        return null; // BlockEditor já renderiza
      }
      // View mode
      return (
        <HeadingTag className="block-heading">
          {headingPayload.html ? (
            <span dangerouslySetInnerHTML={{ __html: headingPayload.html }} />
          ) : (
            headingPayload.text || ''
          )}
        </HeadingTag>
      );
    }

    // Blocos Não-Lexical
    case 'image': {
      const imagePayload = payload as any;
      return (
        <figure className="block-image">
          <img
            src={imagePayload.url}
            alt={imagePayload.alt || ''}
            width={imagePayload.width}
            height={imagePayload.height}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          {imagePayload.caption && (
            <figcaption className="block-image-caption text-sm text-gray-600 mt-2">
              {imagePayload.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'gif': {
      const gifPayload = payload as any;
      return (
        <figure className="block-gif">
          <img
            src={gifPayload.url}
            alt={gifPayload.alt || ''}
            width={gifPayload.width}
            height={gifPayload.height}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </figure>
      );
    }

    case 'separator': {
      const separatorPayload = payload as any;
      const style = separatorPayload.style || 'solid';
      return (
        <hr
          className="block-separator"
          style={{
            border: 'none',
            borderTop: `2px ${style} #d1d5db`,
            margin: '1.5rem 0',
          }}
        />
      );
    }

    case 'youtube_video': {
      const videoPayload = payload as any;
      if (videoPayload.videoId) {
        return (
          <div className="block-embed block-embed-youtube">
            <div className="aspect-video bg-gray-100 rounded overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoPayload.videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        );
      }
      return (
        <div className="block-embed">
          <a href={videoPayload.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {videoPayload.url}
          </a>
        </div>
      );
    }

    case 'table': {
      const tablePayload = payload as any;
      const rows = tablePayload.rows || [];
      const hasHeaders = tablePayload.headers || false;

      if (rows.length === 0) {
        return <div className="block-table-empty text-gray-500 text-sm">Tabela vazia</div>;
      }

      return (
        <div className="block-table overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            {hasHeaders && rows[0] && (
              <thead>
                <tr>
                  {rows[0].cells?.map((cell: any, idx: number) => (
                    <th key={idx} className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">
                      {cell.content || ''}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(hasHeaders ? rows.slice(1) : rows).map((row: any, rowIdx: number) => (
                <tr key={rowIdx}>
                  {row.cells?.map((cell: any, cellIdx: number) => (
                    <td key={cellIdx} className="border border-gray-300 px-4 py-2">
                      {cell.content || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Blocos Container
    case 'columns-2': {
      const columnsPayload = payload as any;
      const children = (columnsPayload.children || []) as PostBlock[];

      const col1 = children.filter((_, idx) => idx % 2 === 0);
      const col2 = children.filter((_, idx) => idx % 2 === 1);

      return (
        <div className="block-columns-2 grid grid-cols-2 gap-4">
          <div className="block-column-1">
            {col1.map((child) => (
              <BlockRendererComponent key={child.id} block={child} mode={mode} onUpdate={onUpdate} />
            ))}
          </div>
          <div className="block-column-2">
            {col2.map((child) => (
              <BlockRendererComponent key={child.id} block={child} mode={mode} onUpdate={onUpdate} />
            ))}
          </div>
        </div>
      );
    }

    case 'collapsible_container': {
      const collapsiblePayload = payload as any;
      const children = (collapsiblePayload.children || []) as PostBlock[];
      const collapsed = collapsiblePayload.collapsed || false;
      const title = collapsiblePayload.title || '';

      return (
        <div className="block-collapsible border rounded-lg">
          <div className="block-collapsible-header p-3 bg-gray-50 border-b font-medium">
            {title || 'Seção Recolhível'}
          </div>
          {!collapsed && (
            <div className="block-collapsible-content p-4">
              {children.map((child) => (
                <BlockRendererComponent key={child.id} block={child} mode={mode} onUpdate={onUpdate} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Bloco Customizado
    case 'citacao_branham': {
      const citacaoPayload = payload as any;
      return (
        <div className="block-citacao-branham border-l-4 border-blue-500 pl-4 py-2 my-4">
          <div className="block-citacao-text prose">
            {citacaoPayload.html ? (
              <div dangerouslySetInnerHTML={{ __html: citacaoPayload.html }} />
            ) : (
              <p>{citacaoPayload.text || ''}</p>
            )}
          </div>
          <div className="block-citacao-source text-sm text-gray-600 mt-2">
            <strong>Fonte:</strong> {citacaoPayload.source || ''}
          </div>
          {citacaoPayload.translation && (
            <div className="block-citacao-translation text-sm text-gray-500 mt-1 italic">
              {citacaoPayload.translation}
            </div>
          )}
        </div>
      );
    }

    default:
      return (
        <div className="block-unknown border rounded p-4 bg-yellow-50">
          <p className="text-yellow-800">Tipo de bloco desconhecido: {type}</p>
        </div>
      );
  }
}

