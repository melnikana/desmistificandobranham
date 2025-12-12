import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate token - get user
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, slug, featured_image_url, status = 'draft', author_id, content } = body;
    if (!title || !slug || !author_id || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('posts').insert([{ title, slug, featured_image_url, status, author_id, content }]);
    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('posts').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
