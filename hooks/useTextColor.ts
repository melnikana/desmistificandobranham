import { useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $isTextNode } from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { TEXT_COLORS, HIGHLIGHT_COLORS } from '@/lib/editorColors';

export function useTextColor() {
  const [editor] = useLexicalComposerContext();

  const applyTextColor = useCallback((colorValue: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // Remove cor anterior primeiro
      $patchStyleText(selection, {
        color: null,
      });

      // Aplica nova cor se não for default
      if (colorValue !== 'default') {
        const color = TEXT_COLORS.find(c => c.value === colorValue);
        if (color) {
          $patchStyleText(selection, {
            color: color.hex,
          });
        }
      }
    });
  }, [editor]);

  const applyHighlight = useCallback((colorValue: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // Remove highlight anterior
      $patchStyleText(selection, {
        'background-color': null,
        'padding': null,
        'border-radius': null,
      });

      // Aplica novo highlight
      const color = HIGHLIGHT_COLORS.find(c => c.value === colorValue);
      if (color) {
        $patchStyleText(selection, {
          'background-color': color.hex,
          'padding': '2px 4px',
          'border-radius': '3px',
        });
      }
    });
  }, [editor]);

  const removeTextColor = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      $patchStyleText(selection, {
        color: null,
      });
    });
  }, [editor]);

  const removeHighlight = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      $patchStyleText(selection, {
        'background-color': null,
        'padding': null,
        'border-radius': null,
      });
    });
  }, [editor]);

  return {
    applyTextColor,
    applyHighlight,
    removeTextColor,
    removeHighlight,
  };
}

