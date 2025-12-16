import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { UpdateBlockData } from '@/lib/blocks/types';
import { validateBlockPayload as validatePayload, sanitizeBlockPayload } from '@/lib/blocks/validators';

/**
 * GET /api/posts/[id]/blocks/[blockId]
 * Busca um bloco específico
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id, blockId } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: block, error } = await supabaseAdmin
      .from('post_blocks')
      .select('*')
      .eq('id', blockId)
      .eq('post_id', id)
      .single();

    if (error) throw error;
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: block });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

/**
 * PUT /api/posts/[id]/blocks/[blockId]
 * Atualiza um bloco
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id, blockId } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateBlockData = await req.json();
    const { type, position, payload } = body;

    // Buscar bloco existente
    const { data: existingBlock, error: fetchError } = await supabaseAdmin
      .from('post_blocks')
      .select('*')
      .eq('id', blockId)
      .eq('post_id', id)
      .single();

    if (fetchError || !existingBlock) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const finalType = type || existingBlock.type;
    const finalPayload = payload || existingBlock.payload;

    // Validar payload se fornecido
    if (payload && !validatePayload(finalType, finalPayload)) {
      return NextResponse.json({ error: 'Invalid payload for block type' }, { status: 400 });
    }

    // Sanitizar payload
    const sanitizedPayload = sanitizeBlockPayload(finalType, finalPayload);

    // Se position mudou, ajustar posições
    if (position !== undefined && position !== existingBlock.position) {
      const oldPosition = existingBlock.position;
      const newPosition = position;

      if (newPosition > oldPosition) {
        // Movendo para frente: diminuir posições dos blocos no meio
        const { data: blocksToUpdate } = await supabaseAdmin
          .from('post_blocks')
          .select('id')
          .eq('post_id', id)
          .gt('position', oldPosition)
          .lte('position', newPosition);

        if (blocksToUpdate) {
          for (const block of blocksToUpdate) {
            await supabaseAdmin
              .from('post_blocks')
              .update({ position: block.position - 1 })
              .eq('id', block.id);
          }
        }
      } else {
        // Movendo para trás: aumentar posições dos blocos no meio
        const { data: blocksToUpdate } = await supabaseAdmin
          .from('post_blocks')
          .select('id')
          .eq('post_id', id)
          .gte('position', newPosition)
          .lt('position', oldPosition);

        if (blocksToUpdate) {
          for (const block of blocksToUpdate) {
            await supabaseAdmin
              .from('post_blocks')
              .update({ position: block.position + 1 })
              .eq('id', block.id);
          }
        }
      }
    }

    // Atualizar bloco
    const updateData: any = {
      payload: sanitizedPayload,
      updated_at: new Date().toISOString(),
    };

    if (type) updateData.type = type;
    if (position !== undefined) updateData.position = position;

    const { data: updatedBlock, error: updateError } = await supabaseAdmin
      .from('post_blocks')
      .update(updateData)
      .eq('id', blockId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, data: updatedBlock });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id]/blocks/[blockId]
 * Deleta um bloco
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id, blockId } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar bloco para obter position
    const { data: block, error: fetchError } = await supabaseAdmin
      .from('post_blocks')
      .select('position')
      .eq('id', blockId)
      .eq('post_id', id)
      .single();

    if (fetchError || !block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Deletar bloco
    const { error: deleteError } = await supabaseAdmin
      .from('post_blocks')
      .delete()
      .eq('id', blockId)
      .eq('post_id', id);

    if (deleteError) throw deleteError;

    // Ajustar posições dos blocos seguintes
    const { data: blocksToUpdate } = await supabaseAdmin
      .from('post_blocks')
      .select('id')
      .eq('post_id', id)
      .gt('position', block.position);

    if (blocksToUpdate) {
      for (const blockToUpdate of blocksToUpdate) {
        await supabaseAdmin
          .from('post_blocks')
          .update({ position: blockToUpdate.position - 1 })
          .eq('id', blockToUpdate.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

