# Guia de Migração para Sistema de Blocos

## Resumo da Implementação

A refatoração do sistema de posts foi implementada com sucesso. O sistema agora usa **blocos independentes** em vez de um conteúdo serializado único do Lexical.

## O que foi Implementado

### ✅ Fase 1: Migração do Banco de Dados
- [x] Script SQL de migração (`migrations/001_create_post_blocks.sql`)
- [x] Tabela `post_blocks` criada com estrutura completa
- [x] Índices e constraints configurados
- [x] Trigger para atualizar `updated_at` automaticamente

### ✅ Fase 2: Backend API
- [x] Tipos TypeScript completos (`lib/blocks/types.ts`)
- [x] Validadores de blocos (`lib/blocks/validators.ts`)
- [x] Conversores Lexical ↔ Blocos (`lib/blocks/converters.ts`)
- [x] Endpoint `GET /api/posts/[id]/blocks` - Listar blocos
- [x] Endpoint `POST /api/posts/[id]/blocks` - Criar bloco
- [x] Endpoint `GET /api/posts/[id]/blocks/[blockId]` - Buscar bloco
- [x] Endpoint `PUT /api/posts/[id]/blocks/[blockId]` - Atualizar bloco
- [x] Endpoint `DELETE /api/posts/[id]/blocks/[blockId]` - Deletar bloco
- [x] Endpoint `POST /api/posts/[id]/blocks/reorder` - Reordenar blocos
- [x] Endpoint `POST /api/posts` atualizado para aceitar blocos
- [x] Endpoint `GET /api/posts/[id]` atualizado para retornar blocos
- [x] Endpoint `PUT /api/posts/[id]` atualizado para trabalhar com blocos

### ✅ Fase 3: Frontend - Componentes
- [x] `BlockEditor` - Editor principal de blocos
- [x] `BlockRenderer` - Renderizador de blocos
- [x] `RichTextBlockEditor` - Editor de texto rico (usa Lexical)
- [x] `HeadingBlockEditor` - Editor de títulos (usa Lexical)
- [x] `ImageBlockEditor` - Editor de imagens (NÃO usa Lexical)
- [x] `SeparatorBlockEditor` - Editor de separadores (NÃO usa Lexical)

### ✅ Fase 4: Script de Migração
- [x] Script `scripts/migrate-posts-to-blocks.ts` para converter posts existentes

## Próximos Passos (Não Implementados Ainda)

### ⏳ Fase 5: Integração no Frontend
- [ ] Atualizar `app/admin/posts/new/page.tsx` para usar `BlockEditor`
- [ ] Atualizar carregamento de posts para buscar blocos
- [ ] Atualizar salvamento para enviar lista de blocos
- [ ] Testar criação, edição e reordenação de blocos

### ⏳ Fase 6: Limpeza
- [ ] Executar script de migração em produção
- [ ] Validar conversão de posts existentes
- [ ] Remover campos `content_text`, `content_json`, `content_html` (após validação)
- [ ] Remover código legado

## Como Usar

### 1. Executar Migração SQL

No Supabase, execute o arquivo:
```sql
migrations/001_create_post_blocks.sql
```

### 2. Migrar Posts Existentes

Execute o script de migração:
```bash
npx tsx scripts/migrate-posts-to-blocks.ts
```

### 3. Atualizar Página de Edição

Substitua o uso de `LexicalEditorComplete` por `BlockEditor` em:
- `app/admin/posts/new/page.tsx`

Exemplo:
```tsx
import BlockEditor from '@/components/admin/BlockEditor';

// Em vez de:
<LexicalEditorComplete onChange={...} />

// Use:
<BlockEditor
  blocks={blocks}
  onChange={setBlocks}
  postId={postId}
/>
```

## Estrutura de Arquivos Criados

```
lib/blocks/
  ├── types.ts          # Tipos TypeScript
  ├── validators.ts     # Validadores de payload
  ├── converters.ts     # Conversores Lexical ↔ Blocos
  └── README.md         # Documentação

app/api/posts/
  ├── route.ts          # POST/GET posts (atualizado)
  └── [id]/
      ├── route.ts      # GET/PUT/DELETE post (novo)
      └── blocks/
          ├── route.ts  # GET/POST blocos
          ├── [blockId]/
          │   └── route.ts  # GET/PUT/DELETE bloco
          └── reorder/
              └── route.ts  # POST reordenar

components/admin/
  ├── BlockEditor.tsx   # Editor principal
  └── blocks/
      ├── BlockRenderer.tsx
      ├── RichTextBlockEditor.tsx
      ├── HeadingBlockEditor.tsx
      ├── ImageBlockEditor.tsx
      └── SeparatorBlockEditor.tsx

migrations/
  └── 001_create_post_blocks.sql

scripts/
  └── migrate-posts-to-blocks.ts
```

## Onde o Lexical Entra

### ✅ Lexical É USADO para:
- Edição de blocos `rich_text`, `heading`, `quote`, `code`
- Renderização do conteúdo desses blocos
- Conversão de markdown para blocos Lexical

### ❌ Lexical NÃO É USADO para:
- Gerenciamento da lista de blocos
- Blocos `image`, `separator`, `embed`, `custom`
- Estrutura de dados do post (armazenada em `post_blocks`)
- API do backend (trabalha com blocos, não com Lexical diretamente)

## Benefícios Alcançados

1. ✅ **Desacoplamento**: Editor pode ser trocado sem quebrar dados
2. ✅ **Flexibilidade**: Novos tipos de blocos sem modificar estrutura existente
3. ✅ **Performance**: Atualizar apenas blocos modificados
4. ✅ **Manutenibilidade**: Código mais organizado e testável
5. ✅ **Escalabilidade**: Fácil adicionar novos tipos de blocos
6. ✅ **Independência**: Blocos não-Lexical funcionam independentemente

## Notas Importantes

- Os campos antigos (`content_text`, `content_json`, `content_html`) ainda existem na tabela `posts` para compatibilidade
- A migração é **não-destrutiva** - posts antigos continuam funcionando
- O script de migração pode ser executado múltiplas vezes (pula posts já migrados)
- A API suporta ambos os formatos durante a transição


