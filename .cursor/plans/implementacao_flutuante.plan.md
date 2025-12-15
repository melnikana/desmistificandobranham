# Novo fluxo + flutuante
## Objetivo
Ter um botão + flutuante por linha ativa, visível ao passar o mouse sobre o wrapper do bloco, sem comportamento de drag.

## Etapas
1. Atualizar `PlusButtonPlugin.tsx`
   - Reduzir lógica a hover sobre cada bloco: usar `mousemove` para saber o bloco sob o cursor e manter `buttonPosition` sincronizado.
   - Remover dependências de drag/DnD.
   - Posicionar o botão dentro do wrapper do bloco (coluna de controles), controlando `opacity` via hover criado pelo JS e CSS.
   - Garantir que o botão mantenha menu contextual funcional (já existente).
2. Ajustar `app/globals.css`
   - Assegurar width 100% e `min-height` nos wrappers, e que o botão + tenha `opacity` e `transition` adequados.
   - Avaliar z-index e pointer-events para que o contenteditable não interfira.
3. Em `LexicalEditorComplete.tsx`, remover o `DragHandlePlugin` e simplificar o uso do editor, mantendo apenas o `PlusButtonPlugin` e demais plugins relevantes.
4. Opcional: manter os menus e modais existentes no `PlusButtonPlugin` (ImageGallery etc.).
