/**
 * Constantes de cores para o editor Lexical
 * Cores otimizadas para o tema claro do Shadcn UI
 */

export interface Color {
  name: string;
  value: string;
  hex: string;
}

export const TEXT_COLORS: Color[] = [
  { name: 'Padrão', value: 'default', hex: '#37352F' },
  { name: 'Vermelho', value: 'red', hex: '#E03E3E' },
  { name: 'Laranja', value: 'orange', hex: '#D9730D' },
  { name: 'Amarelo', value: 'yellow', hex: '#DFAB01' },
  { name: 'Verde', value: 'green', hex: '#0F7B6C' },
  { name: 'Azul', value: 'blue', hex: '#0B6E99' },
  { name: 'Roxo', value: 'purple', hex: '#6940A5' },
  { name: 'Marrom', value: 'brown', hex: '#64473A' },
  { name: 'Cinza', value: 'gray', hex: '#787774' },
  { name: 'Preto', value: 'black', hex: '#000000' },
];

export const HIGHLIGHT_COLORS: Color[] = [
  { name: 'Amarelo', value: 'yellow', hex: '#FEF3C7' },
  { name: 'Laranja', value: 'orange', hex: '#FED7AA' },
  { name: 'Vermelho', value: 'red', hex: '#FECACA' },
  { name: 'Verde', value: 'green', hex: '#BBF7D0' },
  { name: 'Azul', value: 'blue', hex: '#BFDBFE' },
  { name: 'Roxo', value: 'purple', hex: '#E9D5FF' },
  { name: 'Marrom', value: 'brown', hex: '#E7D4C5' },
  { name: 'Cinza', value: 'gray', hex: '#E5E7EB' },
];

export function getTextColorClass(value: string): string {
  return `text-color-${value}`;
}

export function getHighlightColorClass(value: string): string {
  return `highlight-color-${value}`;
}



