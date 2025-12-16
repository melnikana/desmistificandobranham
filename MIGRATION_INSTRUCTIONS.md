# Instruções para Executar Migração SQL no Supabase

## ⚠️ IMPORTANTE: Execute esta migração ANTES de continuar

A tabela `post_blocks` precisa ser criada no Supabase antes de usar o sistema de blocos.

## Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para https://supabase.com/dashboard
- Faça login e selecione seu projeto

### 2. Abra o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Execute o SQL
- Copie TODO o conteúdo do arquivo `scripts/execute-migration.sql`
- Cole no SQL Editor
- Clique em **Run** (ou pressione Cmd/Ctrl + Enter)

### 4. Valide a Criação
- No menu lateral, clique em **Table Editor**
- Verifique que a tabela `post_blocks` aparece na lista
- Clique na tabela para verificar a estrutura:
  - `id` (uuid, primary key)
  - `post_id` (uuid, foreign key para posts)
  - `type` (text)
  - `position` (integer)
  - `payload` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

### 5. Valide Índices e Constraints
- No SQL Editor, execute:
```sql
-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'post_blocks';

-- Verificar constraints
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'post_blocks'::regclass;
```

## SQL Completo

O SQL está no arquivo: `scripts/execute-migration.sql`

## Validação Automática

Após executar o SQL, você pode validar executando:

```bash
npx tsx scripts/run-migration.ts
```

Este script verificará se a tabela foi criada corretamente.

## Estrutura Esperada

A tabela `post_blocks` deve ter:

- **id**: UUID (Primary Key, auto-gerado)
- **post_id**: UUID (Foreign Key para posts.id, CASCADE DELETE)
- **type**: TEXT (CHECK constraint com tipos válidos)
- **position**: INTEGER (NOT NULL)
- **payload**: JSONB (NOT NULL)
- **created_at**: TIMESTAMPTZ (DEFAULT NOW())
- **updated_at**: TIMESTAMPTZ (DEFAULT NOW(), atualizado por trigger)

**Constraints:**
- `unique_post_position`: Garante que não há dois blocos na mesma posição no mesmo post

**Índices:**
- `idx_post_blocks_post_id`: Índice em post_id
- `idx_post_blocks_position`: Índice composto em (post_id, position)
- `idx_post_blocks_type`: Índice em type

**Trigger:**
- `trigger_update_post_blocks_updated_at`: Atualiza `updated_at` automaticamente

## Problemas Comuns

### Erro: "relation posts does not exist"
- Verifique se a tabela `posts` existe no Supabase
- A foreign key requer que `posts` exista primeiro

### Erro: "permission denied"
- Certifique-se de estar usando uma conta com permissões de administrador
- Verifique se está no projeto correto

### Tabela não aparece no Table Editor
- Recarregue a página
- Verifique se executou o SQL completamente (sem erros)

## Próximos Passos

Após validar que a tabela foi criada:

1. ✅ Tabela `post_blocks` criada
2. ⏭️ Continuar com implementação do editor
3. ⏭️ Testar criação de posts com blocos


