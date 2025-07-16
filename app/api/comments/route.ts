import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';
import { auth } from '@/auth';
import { v4 as uuidv4 } from 'uuid';

// GET: Fetch comments for a startup (PUBLIC - no auth required)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startupId = searchParams.get('startupId');

  if (!startupId) {
    return NextResponse.json({ comments: [] });
  }

  try {
    // Fetch all comments for the startup (flat list)
    const allComments = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "comment" && startup._ref == $startupId]{
          _id, text, createdAt, author->{_id, name, username, image}, likes, dislikes, likedBy, dislikedBy, deleted, parent, replies
        }`,
        { startupId }
      );

    // Build a map of comments by _id
    const commentMap = new Map();
    allComments.forEach((c: any) => {
      commentMap.set(c._id, { ...c, replies: [] });
    });

    // Build the tree
    const rootComments: any[] = [];
    allComments.forEach((c: any) => {
      if (c.parent && c.parent._ref) {
        const parent = commentMap.get(c.parent._ref);
        if (parent) {
          parent.replies.push(commentMap.get(c._id));
        }
      } else {
        rootComments.push(commentMap.get(c._id));
      }
    });

    // Optionally, sort replies by createdAt ascending (oldest first)
    function sortReplies(comments: any[]) {
      comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      comments.forEach(c => sortReplies(c.replies));
    }
    sortReplies(rootComments);

    return NextResponse.json({ comments: rootComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ comments: [] });
  }
}

// POST: Add a new comment, reply, like, or dislike (REQUIRES AUTH)
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized - Please log in to comment' }, { status: 401 });
  }

  try {
    const { text, startupId, parentId, action, commentId, userId } = await req.json();
    if (action === 'reply') {
      // Create reply comment
      if (!text || !startupId || !parentId) {
        return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
      }
      const reply = await writeClient.create({
        _type: 'comment',
        text,
        createdAt: new Date().toISOString(),
        author: { _type: 'reference', _ref: session.user.id },
        startup: { _type: 'reference', _ref: startupId },
        parent: { _type: 'reference', _ref: parentId },
      });
      console.log('Created reply:', reply);
      // Patch parent comment to include reply reference
      await writeClient
        .patch(parentId)
        .setIfMissing({ replies: [] })
        .append('replies', [{ _type: 'reference', _ref: reply._id, _key: uuidv4() }])
        .commit();
      return NextResponse.json({ success: true, reply });
    } else if (action === 'like' || action === 'dislike') {
      // Like or dislike a comment
      if (!commentId || !userId) {
        return NextResponse.json({ success: false, message: 'Missing commentId or userId' }, { status: 400 });
      }
      const comment = await client.fetch(`*[_type == "comment" && _id == $id][0]{likedBy, dislikedBy, likes, dislikes}`, { id: commentId });
      let likedBy = comment.likedBy ?? [];
      let dislikedBy = comment.dislikedBy ?? [];
      let likes = comment.likes ?? 0;
      let dislikes = comment.dislikes ?? 0;
      const userHasLiked = likedBy.includes(userId);
      const userHasDisliked = dislikedBy.includes(userId);
      if (action === 'like') {
        if (userHasLiked) {
          likedBy = likedBy.filter((id: any) => id !== userId);
        } else if (userHasDisliked) {
          dislikedBy = dislikedBy.filter((id: any) => id !== userId);
          likedBy.push(userId);
        } else {
          likedBy.push(userId);
        }
      } else if (action === 'dislike') {
        if (userHasDisliked) {
          dislikedBy = dislikedBy.filter((id: any) => id !== userId);
        } else if (userHasLiked) {
          likedBy = likedBy.filter((id: any) => id !== userId);
          dislikedBy.push(userId);
        } else {
          dislikedBy.push(userId);
        }
      }
      likedBy = Array.from(new Set(likedBy));
      dislikedBy = Array.from(new Set(dislikedBy));
      likes = Math.max(0, likedBy.length);
      dislikes = Math.max(0, dislikedBy.length);
      await writeClient.patch(commentId)
        .set({
          likes,
          dislikes,
          likedBy,
          dislikedBy
        })
        .commit();
      return NextResponse.json({ success: true });
    } else {
      // New top-level comment
      if (!text || !startupId) {
        return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
      }
      const comment = await writeClient.create({
        _type: 'comment',
        text,
        createdAt: new Date().toISOString(),
        author: { _type: 'reference', _ref: session.user.id },
        startup: { _type: 'reference', _ref: startupId },
      });
      await writeClient
        .patch(startupId)
        .setIfMissing({ comments: [] })
        .append('comments', [{ _type: 'reference', _ref: comment._id, _key: uuidv4() }])
        .commit();
      return NextResponse.json({ success: true, comment });
    }
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ success: false, message: 'Failed to post comment' }, { status: 500 });
  }
}

// PATCH: Edit a comment (REQUIRES AUTH)
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { commentId, text } = await req.json();
    if (!commentId || !text) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }
    // Only allow author to edit
    const comment = await client.fetch(`*[_type == "comment" && _id == $id][0]{author->{_id}}`, { id: commentId });
    if (!comment || comment.author?._id !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    await writeClient.patch(commentId).set({ text }).commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error editing comment:', error);
    return NextResponse.json({ success: false, message: 'Failed to edit comment' }, { status: 500 });
  }
}

// DELETE: Delete a comment (REQUIRES AUTH)
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { commentId } = await req.json();
    if (!commentId) {
      return NextResponse.json({ success: false, message: 'Missing commentId' }, { status: 400 });
    }
    // Only allow author to delete
    const comment = await client.fetch(`*[_type == "comment" && _id == $id][0]{author->{_id}, startup, parent}`, { id: commentId });
    if (!comment || comment.author?._id !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    
    // Soft delete: mark as deleted instead of removing
    await writeClient.patch(commentId).set({ deleted: true }).commit();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete comment' }, { status: 500 });
  }
} 