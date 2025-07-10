import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import { client } from '@/sanity/lib/client';
import { AUTHOR_BY_ID_QUERY } from '@/sanity/lib/queries';

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

export async function POST(req: NextRequest) {
  const { id, name: reqName, image: reqImage } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  let name = reqName;
  let image = reqImage;
  // Try to fetch user info from Sanity
  try {
    const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
    if (user) {
      name = user.name || name;
      image = user.image || image;
    }
  } catch (e) {
    // If Sanity fetch fails, fallback to provided name/image
  }
  const serverClient = StreamChat.getInstance(apiKey, apiSecret);
  await serverClient.upsertUser({ id, name, image });
  return NextResponse.json({ success: true });
} 