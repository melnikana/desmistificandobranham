# Sistema de Blocos - Documentação

## Visão Geral

Este sistema refatora o modelo de posts de um conteúdo serializado único (baseado em Lexical) para um sistema de **blocos independentes**, onde cada bloco é uma entidade separada no banco de dados.

## Arquitetura

### Princípios Fundamentais

1. **Post = Lista ordenada de blocos independentes**
2. **Lexical = Editor de apenas alguns tipos de bloco** (rich_text, heading, quote, code)
3. **Blocos não-Lexical** são entidades independentes (image, separator, embed, custom)
4. **Backend permite CRUD individual de blocos**

### Estrutura de Dados

#### Tabela `posts`
- Mantém metadados do post (título, slug, status, etc)
- **REMOVIDO**: `content_text`, `content_json`, `content_html`

#### Tabela `post_blocks`
- `id`: UUID único do bloco
- `post_id`: Referência ao post
- `type`: Tipo do bloco (rich_text, heading, image, separator, embed, quote, code, custom)
- `position`: Ordem do bloco (0, 1, 2, ...)
- `payload`: JSONB com dados específicos do tipo

### Tipos de Blocos

#### Blocos que USAM Lexical
- **`rich_text`**: Parágrafo com texto rico
- **`heading`**: Título (H1-H6)
- **`quote`**: Citação
- **`code`**: Bloco de código

**Payload exemplo (rich_text):**
```json
{
  "lexicalState": { /* JSON do Lexical */ },
  "html": "<p>...</p>",
  "text": "texto plano"
}
```

#### Blocos que NÃO USAM Lexical
- **`image`**: Imagem
- **`separator`**: Linha divisória
- **`embed`**: Embed externo (YouTube, etc)
- **`custom`**: Bloco customizado

**Payload exemplo (image):**
```json
{
  "url": "https://...",
  "alt": "descrição",
  "caption": "legenda opcional"
}
```

## API Endpoints

### Posts
- `POST /api/posts` - Criar post (aceita lista de blocos)
- `GET /api/posts/[id]` - Buscar post com blocos
- `PUT /api/posts/[id]` - Atualizar post e blocos
- `DELETE /api/posts/[id]` - Deletar post (blocos deletados em CASCADE)

### Blocos
- `GET /api/posts/[id]/blocks` - Listar blocos do post
- `POST /api/posts/[id]/blocks` - Criar novo bloco
- `GET /api/posts/[id]/blocks/[blockId]` - Buscar bloco específico
- `PUT /api/posts/[id]/blocks/[blockId]` - Atualizar bloco
- `DELETE /api/posts/[id]/blocks/[blockId]` - Deletar bloco
- `POST /api/posts/[id]/blocks/reorder` - Reordenar blocos

## Componentes Frontend

### BlockEditor
Componente principal que gerencia a lista de blocos. Permite:
- Adicionar novos blocos
- Editar blocos existentes
- Deletar blocos
- Reordenar blocos (mover para cima/baixo)

### BlockRenderer
Renderiza um bloco baseado no seu tipo. Suporta modos:
- `view`: Renderização para visualização
- `edit`: Renderização para edição

### Editores Específicos
- `RichTextBlockEditor` - Usa Lexical
- `HeadingBlockEditor` - Usa Lexical
- `ImageBlockEditor` - Upload e configuração
- `SeparatorBlockEditor` - Configuração de estilo

## Migração

### Script de Migração
```bash
npx tsx scripts/migrate-posts-to-blocks.ts
```

O script:
1. Busca todos os posts com `content_json`
2. Converte o JSON do Lexical em blocos individuais
3. Insere os blocos na tabela `post_blocks`

### SQL de Migração
Execute o arquivo `migrations/001_create_post_blocks.sql` no Supabase para criar a tabela.

## Onde o Lexical Entra e Não Entra

### ✅ Lexical É USADO para:
- Edição de blocos do tipo `rich_text`, `heading`, `quote`, `code`
- Renderização do conteúdo desses blocos
- Conversão de markdown para blocos Lexical

### ❌ Lexical NÃO É USADO para:
- Gerenciamento da lista de blocos (feito pelo `BlockEditor`)
- Blocos do tipo `image`, `separator`, `embed`, `custom`
- Estrutura de dados do post (armazenada em `post_blocks`)
- API do backend (trabalha com blocos, não com Lexical diretamente)

## Benefícios

1. **Desacoplamento**: Editor pode ser trocado sem quebrar dados
2. **Flexibilidade**: Novos tipos de blocos sem modificar estrutura existente
3. **Performance**: Atualizar apenas blocos modificados
4. **Manutenibilidade**: Código mais organizado e testável
5. **Escalabilidade**: Fácil adicionar novos tipos de blocos
6. **Versionamento**: Possível versionar blocos individualmente no futuro

## Próximos Passos

1. Atualizar página de edição (`app/admin/posts/new/page.tsx`) para usar `BlockEditor`
2. Executar script de migração para converter posts existentes
3. Testar criação, edição e reordenação de blocos
4. Implementar editores para tipos restantes (embed, custom)
5. Remover campos antigos (`content_text`, `content_json`, `content_html`) após validação


