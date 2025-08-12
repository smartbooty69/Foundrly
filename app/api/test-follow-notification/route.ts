import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createFollowNotification } from '@/sanity/lib/notifications';

export async function POST() {
  try {
    console.log('✅ Test follow notification endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Creating test follow notification for user:', session.user.id);

    try {
      console.log('🔔 Attempting to create follow notification with data:', {
        followerId: session.user.id,
        followedId: session.user.id, // Same user for testing
        followerName: session.user.name || session.user.username || 'Test User',
        followerImage: session.user.image
      });

      // Create a test follow notification without external references for testing
      const notificationId = await createFollowNotification(
        session.user.id, // follower (same as recipient for testing)
        session.user.id, // followed (same as recipient for testing)
        session.user.name || session.user.username || 'Test User', // follower name
        session.user.image // follower image
      );

      console.log('✅ Test follow notification created successfully:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Test follow notification created',
        notificationId,
        user: {
          id: session.user.id,
          name: session.user.name || session.user.username
        },
        notificationType: 'follow',
        followerName: session.user.name || session.user.username || 'Test User',
        metadata: {
          userName: session.user.name || session.user.username || 'Test User',
          userImage: session.user.image
        }
      });

    } catch (sanityError: any) {
      console.error('❌ Sanity error creating test follow notification:', {
        error: sanityError,
        message: sanityError.message,
        stack: sanityError.stack,
        name: sanityError.name
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create follow notification in Sanity',
        details: sanityError.message || 'Unknown Sanity error'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in test follow notification:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({
      success: false,
      error: 'System error',
      details: error.message || 'Unknown system error'
    }, { status: 500 });
  }
} 