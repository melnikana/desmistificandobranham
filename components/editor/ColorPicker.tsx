"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Color } from '@/lib/editorColors';

interface ColorPickerProps {
  colors: Color[];
  currentColor?: string;
  onSelectColor: (color: string) => void;
  onRemoveColor: () => void;
  type: 'text' | 'highlight';
}

export function ColorPicker({
  colors,
  currentColor,
  onSelectColor,
  onRemoveColor,
  type,
}: ColorPickerProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  return (
    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[240px] z-50">
      {/* Grid de cores */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {colors.map((color) => {
          const isActive = currentColor === color.value;
          const isHovered = hoveredColor === color.value;

          return (
            <div key={color.value} className="relative">
              <button
                onClick={() => onSelectColor(color.value)}
                onMouseEnter={() => setHoveredColor(color.value)}
                onMouseLeave={() => setHoveredColor(null)}
                className={`
                  w-8 h-8 rounded-md transition-all duration-150
                  ${isActive ? 'ring-2 ring-gray-900 ring-offset-2' : ''}
                  ${isHovered && !isActive ? 'ring-2 ring-gray-400 ring-offset-1' : ''}
                  hover:scale-110
                `}
                style={{
                  backgroundColor: color.hex,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
                title={color.name}
                aria-label={`${type === 'text' ? 'Cor de texto' : 'Cor de destaque'}: ${color.name}`}
              />
              
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                  {color.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão para remover cor */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRemoveColor}
        className="w-full text-gray-700 hover:bg-gray-100 border-gray-200 text-sm"
      >
        <X className="h-3.5 w-3.5 mr-2" />
        Remover {type === 'text' ? 'cor' : 'destaque'}
      </Button>
    </div>
  );
}



