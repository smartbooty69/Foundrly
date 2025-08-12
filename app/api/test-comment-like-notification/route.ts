import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification } from '@/sanity/lib/notifications';

export async function POST() {
  try {
    console.log('✅ Test comment like notification endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Creating test comment like notification for user:', session.user.id);

    try {
      console.log('🔔 Attempting to create comment like notification with data:', {
        likerId: session.user.id,
        commentAuthorId: session.user.id, // Same user for testing
        commentId: 'test-comment-123',
        commentText: 'This is a great comment that someone liked!',
        startupId: 'test-startup-456',
        startupTitle: 'Test Startup for Comment Likes',
        likerName: session.user.name || session.user.username || 'Test User',
        likerImage: session.user.image
      });

      // Create a test comment like notification without external references for testing
      const notificationId = await createNotification({
        recipientId: session.user.id,
        type: 'comment_like',
        title: 'Comment Liked',
        message: 'liked your comment',
        senderId: session.user.id,
        actionUrl: '/test-notifications',
        metadata: {
          startupTitle: 'Test Startup for Comment Likes',
          commentText: 'This is a great comment that someone liked!',
          userName: session.user.name || session.user.username || 'Test User',
          userImage: session.user.image
        }
      });

      console.log('✅ Test comment like notification created successfully:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Test comment like notification created',
        notificationId,
        user: {
          id: session.user.id,
          name: session.user.name || session.user.username
        },
        notificationType: 'comment_like',
        commentText: 'This is a great comment that someone liked!',
        startupTitle: 'Test Startup for Comment Likes',
        metadata: {
          userName: session.user.name || session.user.username || 'Test User',
          commentText: 'This is a great comment that someone liked!',
          startupTitle: 'Test Startup for Comment Likes'
        }
      });

    } catch (sanityError: any) {
      console.error('❌ Sanity error creating test comment like notification:', {
        error: sanityError,
        message: sanityError.message,
        stack: sanityError.stack,
        name: sanityError.name
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create comment like notification in Sanity',
        details: sanityError.message || 'Unknown Sanity error'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in test comment like notification:', {
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