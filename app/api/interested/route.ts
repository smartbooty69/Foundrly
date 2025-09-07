import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';
import { auth } from '@/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ interestedBy: [] });
  }

  try {
    const data = await client.withConfig({ useCdn: false }).fetch(`*[_type == "startup" && _id == $id][0]{ interestedBy }`, { id });
    return NextResponse.json({ interestedBy: data?.interestedBy ?? [] });
  } catch (error) {
    console.error('Error in interested GET:', error);
    return NextResponse.json({ interestedBy: [] });
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
        message: 'Account is suspended. You cannot show interest in content.' 
      }, { status: 403 });
    }
  }

  try {
    // Fetch the current document state
    const doc = await client.withConfig({ useCdn: false }).fetch(`*[_type == "startup" && _id == $id][0]{ interestedBy }`, { id });

    if (!doc) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    let interestedBy = doc.interestedBy ?? [];
    const userHasInterested = interestedBy.includes(userId);

    // Toggle interested state
    if (userHasInterested) {
      // User is un-interested
      interestedBy = interestedBy.filter((id: any) => id !== userId);
    } else {
      // User is interested
      interestedBy.push(userId);
    }

    // Atomically set the new state
    const result = await writeClient
      .patch(id)
      .set({
        interestedBy: interestedBy,
      })
      .commit();

    return NextResponse.json({ 
      success: true, 
      interested: !userHasInterested,
      interestedBy: interestedBy,
      ...result 
    });
  } catch (error) {
    console.error('Error toggling interested:', error);
    return NextResponse.json({ success: false, message: 'Failed to toggle interested' }, { status: 500 });
  }
}


