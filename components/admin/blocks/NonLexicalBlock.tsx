"use client";

import React from 'react';
import type { PostBlock } from '@/lib/blocks/types';

interface NonLexicalBlockProps {
  block: PostBlock;
}

/**
 * Renderiza blocos não-textuais como HTML simples
 * NÃO usa Lexical
 */
export default function NonLexicalBlock({ block }: NonLexicalBlockProps) {
  const { type, payload } = block;

  switch (type) {
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
            width: '100%',
          }}
        />
      );
    }

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

    default:
      return (
        <div className="block-unknown border rounded p-4 bg-yellow-50">
          <p className="text-yellow-800">Tipo de bloco desconhecido: {type}</p>
        </div>
      );
  }
}

