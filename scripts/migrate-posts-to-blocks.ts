/**
 * Script de migração: Converte posts do formato antigo (content_json) para blocos
 * 
 * Uso:
 *   npx tsx scripts/migrate-posts-to-blocks.ts
 * 
 * Requer:
 *   - Variáveis de ambiente do Supabase configuradas
 *   - Tabela post_blocks criada
 */

import { supabaseAdmin } from '../lib/supabaseAdmin';
import { lexicalToBlocks } from '../lib/blocks/converters';

async function migratePosts() {
  console.log('🚀 Iniciando migração de posts para sistema de blocos...\n');

  try {
    // Buscar todos os posts que têm content_json
    const { data: posts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, title, content_json')
      .not('content_json', 'is', null);

    if (fetchError) {
      throw new Error(`Erro ao buscar posts: ${fetchError.message}`);
    }

    if (!posts || posts.length === 0) {
      console.log('✅ Nenhum post encontrado para migrar.');
      return;
    }

    console.log(`📦 Encontrados ${posts.length} posts para migrar.\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        console.log(`Migrando post: ${post.title} (ID: ${post.id})`);

        // Verificar se já tem blocos
        const { data: existingBlocks } = await supabaseAdmin
          .from('post_blocks')
          .select('id')
          .eq('post_id', post.id)
          .limit(1);

        if (existingBlocks && existingBlocks.length > 0) {
          console.log(`  ⏭️  Post já tem blocos, pulando...\n`);
          continue;
        }

        // Converter content_json para blocos
        let blocks;
        try {
          const lexicalState = typeof post.content_json === 'string'
            ? JSON.parse(post.content_json)
            : post.content_json;

          blocks = lexicalToBlocks(lexicalState);
        } catch (parseError) {
          console.error(`  ❌ Erro ao parsear content_json:`, parseError);
          errorCount++;
          continue;
        }

        if (blocks.length === 0) {
          console.log(`  ⚠️  Nenhum bloco extraído do conteúdo.\n`);
          continue;
        }

        // Inserir blocos
        const blocksToInsert = blocks.map((block) => ({
          post_id: post.id,
          type: block.type,
          position: block.position,
          payload: block.payload,
        }));

        const { error: insertError } = await supabaseAdmin
          .from('post_blocks')
          .insert(blocksToInsert);

        if (insertError) {
          throw new Error(insertError.message);
        }

        console.log(`  ✅ ${blocks.length} blocos criados com sucesso.\n`);
        successCount++;
      } catch (error: any) {
        console.error(`  ❌ Erro ao migrar post ${post.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Resumo da migração:');
    console.log(`  ✅ Sucesso: ${successCount}`);
    console.log(`  ❌ Erros: ${errorCount}`);
    console.log(`  📦 Total: ${posts.length}\n`);

    if (errorCount === 0) {
      console.log('🎉 Migração concluída com sucesso!');
    } else {
      console.log('⚠️  Migração concluída com alguns erros.');
    }
  } catch (error: any) {
    console.error('❌ Erro fatal na migração:', error);
    process.exit(1);
  }
}

// Executar migração
if (require.main === module) {
  migratePosts()
    .then(() => {
      console.log('\n✅ Script finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { migratePosts };


