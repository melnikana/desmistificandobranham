-- Migration: Criar tabela post_blocks
-- Data: 2024
-- Descrição: Cria tabela para armazenar blocos de conteúdo dos posts
--
-- INSTRUÇÕES:
-- 1. Copie TODO este conteúdo
-- 2. Acesse o Supabase Dashboard > SQL Editor
-- 3. Cole o SQL abaixo
-- 4. Execute (Run)
-- 5. Valide no Table Editor que a tabela post_blocks foi criada

-- Criar tabela post_blocks
CREATE TABLE IF NOT EXISTS post_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'heading', 'bullet_list', 'numbered_list', 'quote', 'code_block', 'separator', 'image', 'gif', 'youtube_video', 'table', 'columns-2', 'collapsible_container', 'citacao_branham')),
  position INTEGER NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_post_position UNIQUE(post_id, position)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_post_blocks_post_id ON post_blocks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_blocks_position ON post_blocks(post_id, position);
CREATE INDEX IF NOT EXISTS idx_post_blocks_type ON post_blocks(type);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_post_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_post_blocks_updated_at
  BEFORE UPDATE ON post_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_post_blocks_updated_at();

-- Comentários para documentação
COMMENT ON TABLE post_blocks IS 'Armazena blocos de conteúdo dos posts de forma independente';
COMMENT ON COLUMN post_blocks.type IS 'Tipo do bloco: text, heading, bullet_list, numbered_list, quote, code_block, separator, image, gif, youtube_video, table, columns-2, collapsible_container, citacao_branham';
COMMENT ON COLUMN post_blocks.position IS 'Posição/ordem do bloco no post (0, 1, 2, ...)';
COMMENT ON COLUMN post_blocks.payload IS 'Dados específicos do tipo de bloco em formato JSONB';


