"use client";

import { DecoratorNode, EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import React from 'react';

type SerializedGifNode = Spread<{
  url: string;
  alt?: string;
  type: 'gif';
  version: 1;
}, SerializedLexicalNode>;

export class GifNode extends DecoratorNode<React.ReactElement> {
  __url: string;
  __alt?: string;

  static getType(): string {
    return 'gif';
  }

  static clone(node: GifNode): GifNode {
    return new GifNode(node.__url, node.__alt, node.__key);
  }

  constructor(url: string, alt?: string, key?: NodeKey) {
    super(key);
    this.__url = url;
    this.__alt = alt;
  }

  static importJSON(serializedNode: SerializedGifNode): GifNode {
    const node = $createGifNode(serializedNode.url, serializedNode.alt);
    return node;
  }

  exportJSON(): SerializedGifNode {
    return {
      type: 'gif',
      url: this.__url,
      alt: this.__alt,
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    div.style.marginTop = '1rem';
    div.style.marginBottom = '1rem';
    
    const img = document.createElement('img');
    img.src = this.__url;
    img.alt = this.__alt || 'GIF';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '0.5rem';
    
    div.appendChild(img);
    return div;
  }

  updateDOM(prevNode: GifNode, dom: HTMLElement): boolean {
    const img = dom.querySelector('img');
    if (img && prevNode.__url !== this.__url) {
      img.src = this.__url;
      img.alt = this.__alt || 'GIF';
      return false;
    }
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getTextContent(): string {
    return '';
  }

  decorate(): React.ReactElement {
    return (
      <div className="text-center my-4">
        <img 
          src={this.__url} 
          alt={this.__alt || 'GIF'} 
          className="max-w-full h-auto rounded-lg inline-block"
        />
      </div>
    );
  }
}

export function $createGifNode(url: string, alt?: string): GifNode {
  return new GifNode(url, alt);
}

export function $isGifNode(node: any): node is GifNode {
  return node instanceof GifNode;
}




