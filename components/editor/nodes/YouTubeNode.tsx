"use client";

import { DecoratorNode, EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import React from 'react';

type SerializedYouTubeNode = Spread<{
  url: string;
  type: 'youtube';
  version: 1;
}, SerializedLexicalNode>;

function getYouTubeID(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export class YouTubeNode extends DecoratorNode<React.ReactElement> {
  __url: string;

  static getType(): string {
    return 'youtube';
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__url, node.__key);
  }

  constructor(url: string, key?: NodeKey) {
    super(key);
    this.__url = url;
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    const node = $createYouTubeNode(serializedNode.url);
    return node;
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      type: 'youtube',
      url: this.__url,
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.style.position = 'relative';
    div.style.paddingBottom = '56.25%';
    div.style.height = '0';
    div.style.overflow = 'hidden';
    div.style.maxWidth = '100%';
    div.style.marginTop = '1rem';
    div.style.marginBottom = '1rem';
    
    const videoID = getYouTubeID(this.__url);
    if (videoID) {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.src = `https://www.youtube.com/embed/${videoID}`;
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      div.appendChild(iframe);
    }
    
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getTextContent(): string {
    return '';
  }

  decorate(): React.ReactElement {
    const videoID = getYouTubeID(this.__url);
    
    if (!videoID) {
      return (
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">URL do YouTube inválida</p>
        </div>
      );
    }

    return (
      <div className="relative w-full my-4" style={{ paddingBottom: '56.25%', height: 0 }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoID}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    );
  }
}

export function $createYouTubeNode(url: string): YouTubeNode {
  return new YouTubeNode(url);
}

export function $isYouTubeNode(node: any): node is YouTubeNode {
  return node instanceof YouTubeNode;
}




