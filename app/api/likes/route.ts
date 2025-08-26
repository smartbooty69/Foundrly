import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';
import { auth } from '@/auth';
import { createLikeNotification } from '@/sanity/lib/notifications';

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
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = session.user.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'No ID provided' }, { status: 400 });
  }

  // Check if user is banned
  const user = await client.fetch(
    `*[_type == "author" && _id == $userId][0]{ _id, bannedUntil, isBanned }`,
    { userId }
  );

  if (user?.isBanned) {
    const isCurrentlyBanned = user.bannedUntil ? new Date() < new Date(user.bannedUntil) : true;
    if (isCurrentlyBanned) {
      return NextResponse.json({ 
        success: false, 
        message: 'Account is suspended. You cannot like/dislike content.' 
      }, { status: 403 });
    }
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

    // Create notification for new like (only if it's a new like, not un-liking)
    if (!userHasLiked && likes > doc.likes) {
      try {
        // Get startup owner and startup details
        const startup = await client.fetch(
          `*[_type == "startup" && _id == $startupId][0]{
            author->{_id, name, username, image},
            title
          }`,
          { startupId: id }
        );

        if (startup && startup.author?._id !== userId) {
          // Only create notification if liker is not the startup owner
          await createLikeNotification(
            userId, // liker
            startup.author._id, // startup owner
            id, // startup ID
            startup.title,
            session.user.name || session.user.username || 'Unknown User',
            session.user.image
          );
  
        }
      } catch (notificationError) {
        console.error('Failed to create like notification:', notificationError);
        // Don't fail the entire request if notification creation fails
      }
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error toggling likes:', error);
    return NextResponse.json({ success: false, message: 'Failed to toggle likes' }, { status: 500 });
  }
} 