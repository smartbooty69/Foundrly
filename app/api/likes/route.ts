import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ likes: 0, likedBy: [] });
  }

  try {
    const data = await client.withConfig({ useCdn: false }).fetch(`*[_type == "startup" && _id == $id][0]{ likes, likedBy, dislikes, dislikedBy }`, { id });
    return NextResponse.json({ likes: data?.likes ?? 0, likedBy: data?.likedBy ?? [], dislikes: data?.dislikes ?? 0, dislikedBy: data?.dislikedBy ?? [] });
  } catch (error) {
    console.error('Error in likes GET:', error);
    return NextResponse.json({ likes: 0, likedBy: [], dislikes: 0, dislikedBy: [] });
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  let userId;
  try {
    const body = await req.json();
    userId = body.userId;
  } catch {
    return NextResponse.json({ success: false, message: 'No userId provided' }, { status: 400 });
  }

  if (!id || !userId) {
    return NextResponse.json({ success: false, message: 'No ID or userId provided' }, { status: 400 });
  }

  try {
    // Fetch the current document state
    const doc = await client.withConfig({ useCdn: false }).fetch(`*[_type == "startup" && _id == $id][0]{ likedBy, dislikedBy, likes, dislikes }`, { id });

    if (!doc) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    let likedBy = doc.likedBy ?? [];
    let dislikedBy = doc.dislikedBy ?? [];
    let likes = doc.likes ?? 0;
    let dislikes = doc.dislikes ?? 0;

    const userHasLiked = likedBy.includes(userId);
    const userHasDisliked = dislikedBy.includes(userId);

    // Calculate the new state based on the user's action
    if (userHasLiked) {
      // User is un-liking
      likes--;
      likedBy = likedBy.filter((id: any) => id !== userId);
    } else if (userHasDisliked) {
      // User is switching from dislike to like
      dislikes--;
      likes++;
      dislikedBy = dislikedBy.filter((id: any) => id !== userId);
      likedBy.push(userId);
    } else {
      // User is adding a new like
      likes++;
      likedBy.push(userId);
    }

    // Atomically set the new state
    const result = await writeClient
      .patch(id)
      .set({
        likes: Math.max(0, likes), // Ensure counts don't go below zero
        dislikes: Math.max(0, dislikes),
        likedBy: likedBy,
        dislikedBy: dislikedBy,
      })
      .commit();

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error toggling likes:', error);
    return NextResponse.json({ success: false, message: 'Failed to toggle likes' }, { status: 500 });
  }
} 