import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { CreateBlockData } from '@/lib/blocks/types';
import { validateBlockPayload as validatePayload, sanitizeBlockPayload } from '@/lib/blocks/validators';

/**
 * GET /api/posts/[id]/blocks
 * Lista todos os blocos de um post ordenados por position
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

    // Buscar blocos do post ordenados por position
    const { data: blocks, error } = await supabaseAdmin
      .from('post_blocks')
      .select('*')
      .eq('post_id', id)
      .order('position', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ ok: true, data: blocks || [] });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

/**
 * POST /api/posts/[id]/blocks
 * Cria um novo bloco no post
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

    const body: CreateBlockData = await req.json();
    const { type, position, payload } = body;

    if (!type || position === undefined || !payload) {
      return NextResponse.json({ error: 'Missing fields: type, position, payload' }, { status: 400 });
    }

    // Validar payload
    if (!validatePayload(type, payload)) {
      return NextResponse.json({ error: 'Invalid payload for block type' }, { status: 400 });
    }

    // Sanitizar payload
    const sanitizedPayload = sanitizeBlockPayload(type, payload);

    // Verificar se o post existe
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Ajustar posições dos blocos existentes se necessário
    // Se position já existe, mover blocos para frente
    const { data: existingBlocks } = await supabaseAdmin
      .from('post_blocks')
      .select('id, position')
      .eq('post_id', id)
      .gte('position', position);

    if (existingBlocks && existingBlocks.length > 0) {
      // Atualizar posições
      for (const block of existingBlocks) {
        await supabaseAdmin
          .from('post_blocks')
          .update({ position: block.position + 1 })
          .eq('id', block.id);
      }
    }

    // Criar novo bloco
    const { data: newBlock, error: insertError } = await supabaseAdmin
      .from('post_blocks')
      .insert([{
        post_id: id,
        type,
        position,
        payload: sanitizedPayload,
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, data: newBlock });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

