import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { STARTUP_VIEWS_QUERY } from '@/sanity/lib/queries';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ views: 0 });
  }

  try {
    const data = await client.withConfig({ useCdn: false }).fetch(STARTUP_VIEWS_QUERY, { id });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ views: 0 });
  }
}

