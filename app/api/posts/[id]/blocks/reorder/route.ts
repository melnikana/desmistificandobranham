import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { ReorderBlocksData } from '@/lib/blocks/types';

/**
 * POST /api/posts/[id]/blocks/reorder
 * Reordena os blocos de um post
 */
export async function POST(
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

    const body: ReorderBlocksData = await req.json();
    const { blockIds } = body;

    if (!Array.isArray(blockIds) || blockIds.length === 0) {
      return NextResponse.json({ error: 'blockIds must be a non-empty array' }, { status: 400 });
    }

    // Verificar se todos os blocos pertencem ao post
    const { data: existingBlocks, error: fetchError } = await supabaseAdmin
      .from('post_blocks')
      .select('id')
      .eq('post_id', id)
      .in('id', blockIds);

    if (fetchError) throw fetchError;

    if (!existingBlocks || existingBlocks.length !== blockIds.length) {
      return NextResponse.json({ error: 'Some blocks not found or do not belong to this post' }, { status: 400 });
    }

    // Atualizar posições na ordem fornecida
    const updates = blockIds.map((blockId, index) => ({
      id: blockId,
      position: index,
    }));

    // Executar updates em transação (usando Promise.all)
    const updatePromises = updates.map(({ id: blockId, position }) =>
      supabaseAdmin
        .from('post_blocks')
        .update({ position })
        .eq('id', blockId)
        .eq('post_id', id)
    );

    await Promise.all(updatePromises);

    // Buscar blocos atualizados
    const { data: updatedBlocks, error: selectError } = await supabaseAdmin
      .from('post_blocks')
      .select('*')
      .eq('post_id', id)
      .in('id', blockIds)
      .order('position', { ascending: true });

    if (selectError) throw selectError;

    return NextResponse.json({ ok: true, data: updatedBlocks || [] });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

