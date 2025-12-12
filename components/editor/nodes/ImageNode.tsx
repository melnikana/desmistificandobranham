import { DecoratorNode } from 'lexical';
import React from 'react';

type SerializedImageNode = {
  type: 'image';
  version: 1;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt?: string;

  static getType() {
    return 'image';
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__alt, node.__key);
  }

  constructor(src: string, alt?: string, key?: string) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  createDOM() {
    const img = document.createElement('img');
    img.src = this.__src;
    img.alt = this.__alt || '';
    img.style.maxWidth = '100%';
    return img;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
    };
  }

  isInline() {
    return false;
  }

  getTextContent(_includeInert?: boolean) {
    return '';
  }

  decorate() {
    return <img src={this.__src} alt={this.__alt} style={{ maxWidth: '100%' }} />;
  }
}

export function $createImageNode(src: string, alt?: string) {
  const node = new ImageNode(src, alt);
  return node;
}

export function $isImageNode(node: any): node is ImageNode {
  return node instanceof ImageNode;
}
