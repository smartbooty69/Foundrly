import { NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/write-client';
import { canUserPerformAction } from '@/lib/ban-checks';
import { createFollowNotification } from '@/sanity/lib/notifications';

export async function POST(req: Request) {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return NextResponse.json({ 
        success: false, 
        message: 'Method not allowed' 
      }, { status: 405 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    const { profileId, currentUserId, action } = body;
    console.log('API /api/follow called:', { profileId, currentUserId, action });
    console.log('Token present:', !!writeClient.config().token);
    console.log('writeClient config:', writeClient.config());

    // Validate required fields
    if (!profileId || !currentUserId || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: profileId, currentUserId, or action' 
      }, { status: 400 });
    }

    if (!['follow', 'unfollow', 'remove_follower'].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid action. Must be "follow", "unfollow", or "remove_follower"' 
      }, { status: 400 });
    }

    // Check if user is banned
    const banCheck = await canUserPerformAction(currentUserId);
    if (!banCheck.canPerform) {
      return NextResponse.json({ 
        success: false, 
        message: banCheck.message 
      }, { status: 403 });
    }

    // Validate token
    if (!writeClient.config().token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Server configuration error' 
      }, { status: 500 });
    }

    // Fetch current state
    let profile, currentUser;
    try {
      [profile, currentUser] = await Promise.all([
        writeClient.getDocument(profileId),
        writeClient.getDocument(currentUserId),
      ]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch user data' 
      }, { status: 500 });
    }

    if (!profile || !currentUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'One or both users not found' 
      }, { status: 404 });
    }

    console.log('Fetched profile:', profile);
    console.log('Fetched currentUser:', currentUser);

    const alreadyFollowing = Array.isArray(profile?.followers) && profile.followers.some((ref: any) => ref._ref === currentUserId);
    const alreadyInFollowing = Array.isArray(currentUser?.following) && currentUser.following.some((ref: any) => ref._ref === profileId);
    console.log('alreadyFollowing:', alreadyFollowing, 'alreadyInFollowing:', alreadyInFollowing);

    const profilePatch = writeClient.patch(profileId);
    const currentUserPatch = writeClient.patch(currentUserId);

    if (action === 'follow') {
      if (!alreadyFollowing) {
        console.log('Appending to followers');
        // Ensure followers array exists, then append
        profilePatch.setIfMissing({ followers: [] }).append('followers', [{ 
          _type: 'reference', 
          _ref: currentUserId,
          _key: `follower_${currentUserId}`
        }]);
      }
      if (!alreadyInFollowing) {
        console.log('Appending to following');
        // Ensure following array exists, then append
        currentUserPatch.setIfMissing({ following: [] }).append('following', [{ 
          _type: 'reference', 
          _ref: profileId,
          _key: `following_${profileId}`
        }]);
      }
    } else if (action === 'remove_follower') {
      console.log('Removing follower');
      // Remove the follower from the current user's followers list
      profilePatch.unset([`followers[_ref=="${currentUserId}"]`]);
      // Remove the current user from the follower's following list
      currentUserPatch.unset([`following[_ref=="${profileId}"]`]);
    } else {
      console.log('Unsetting followers and following');
      profilePatch.unset([`followers[_ref=="${currentUserId}"]`]);
      currentUserPatch.unset([`following[_ref=="${profileId}"]`]);
    }

    let result;
    try {
      result = await writeClient.transaction()
        .patch(profilePatch)
        .patch(currentUserPatch)
        .commit();
    } catch (error) {
      console.error('Sanity mutation error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update follow status in database' 
      }, { status: 500 });
    }

    console.log('Sanity mutation result:', result);

    // Create notification for new follow (only if it's a new follow)
    if (action === 'follow' && !alreadyFollowing) {
      try {
        await createFollowNotification(
          currentUserId,
          profileId,
          currentUser.name || currentUser.username || 'Unknown User',
          currentUser.image
        );
        console.log('Follow notification created successfully');
      } catch (notificationError) {
        console.error('Failed to create follow notification:', notificationError);
        // Don't fail the entire request if notification creation fails
      }
    }

    // Return updated followers/following for instant UI update
    let updatedProfile, updatedCurrentUser;
    try {
      [updatedProfile, updatedCurrentUser] = await Promise.all([
        writeClient.getDocument(profileId),
        writeClient.getDocument(currentUserId),
      ]);
    } catch (error) {
      console.error('Error fetching updated documents:', error);
      // Still return success since the mutation was successful
      return NextResponse.json({
        success: true,
        message: 'Follow status updated successfully',
        followers: [],
        following: [],
      });
    }

    console.log('Updated profile:', updatedProfile);
    console.log('Updated currentUser:', updatedCurrentUser);

    return NextResponse.json({
      success: true,
      followers: Array.isArray(updatedProfile?.followers) ? updatedProfile.followers : [],
      following: Array.isArray(updatedCurrentUser?.following) ? updatedCurrentUser.following : [],
    });
  } catch (error) {
    console.error('Unexpected error in follow API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An unexpected error occurred. Please try again later.' 
    }, { status: 500 });
  }
}