import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { PostWithBlocks, CreateBlockData } from '@/lib/blocks/types';
import { sanitizeBlockPayload } from '@/lib/blocks/validators';

/**
 * GET /api/posts/[id]
 * Busca um post com seus blocos
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError) throw postError;
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Buscar blocos do post
    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from('post_blocks')
      .select('*')
      .eq('post_id', id)
      .order('position', { ascending: true });

    if (blocksError) throw blocksError;

    const postWithBlocks: PostWithBlocks = {
      ...post,
      blocks: blocks || [],
    };

    return NextResponse.json({ ok: true, data: postWithBlocks });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

/**
 * PUT /api/posts/[id]
 * Atualiza um post e seus blocos
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      status,
      featured_image_url,
      publish_date,
      categories,
      tags,
      blocks, // Lista de blocos opcional
    } = body;

    // Atualizar post
    const postUpdateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) postUpdateData.title = title;
    if (slug !== undefined) postUpdateData.slug = slug;
    if (status !== undefined) postUpdateData.status = status;
    if (featured_image_url !== undefined) postUpdateData.featured_image_url = featured_image_url;
    if (publish_date !== undefined) postUpdateData.publish_date = publish_date;
    if (categories !== undefined) postUpdateData.categories = categories;
    if (tags !== undefined) postUpdateData.tags = tags;

    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update(postUpdateData)
      .eq('id', id);

    if (updateError) throw updateError;

    // Se blocos foram fornecidos, atualizar blocos
    if (Array.isArray(blocks)) {
      // Deletar blocos existentes
      await supabaseAdmin
        .from('post_blocks')
        .delete()
        .eq('post_id', id);

      // Inserir novos blocos
      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block: CreateBlockData, index: number) => ({
          post_id: id,
          type: block.type,
          position: block.position !== undefined ? block.position : index,
          payload: sanitizeBlockPayload(block.type, block.payload),
        }));

        const { error: insertError } = await supabaseAdmin
          .from('post_blocks')
          .insert(blocksToInsert);

        if (insertError) throw insertError;
      }
    }

    // Buscar post atualizado com blocos
    const { data: updatedPost } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    const { data: updatedBlocks } = await supabaseAdmin
      .from('post_blocks')
      .select('*')
      .eq('post_id', id)
      .order('position', { ascending: true });

    const postWithBlocks: PostWithBlocks = {
      ...updatedPost,
      blocks: updatedBlocks || [],
    };

    return NextResponse.json({ ok: true, data: postWithBlocks });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id]
 * Deleta um post e seus blocos (CASCADE)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Deletar post (blocos serão deletados automaticamente por CASCADE)
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}


