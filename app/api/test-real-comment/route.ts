import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification } from '@/sanity/lib/notifications';

export async function POST() {
  try {
    console.log('✅ Test real comment scenario endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Testing real comment scenario for user:', session.user.id);

    try {
      // This simulates what happens when someone comments on a real startup
      // In a real scenario, the startup would already exist in the database
      const mockStartupId = 'mock-startup-123';
      const mockStartupTitle = 'Mock Startup for Testing';
      
      console.log('🔔 Simulating comment on startup:', mockStartupTitle);
      
      // Create a simple comment notification without references for testing
      const notificationId = await createNotification({
        recipientId: session.user.id,
        type: 'comment',
        title: 'Test Comment on Startup',
        message: 'commented on your startup',
        senderId: session.user.id,
        actionUrl: '/test-notifications',
        metadata: {
          userName: session.user.name || session.user.username || 'Test User',
          userImage: session.user.image,
          startupTitle: mockStartupTitle,
          commentText: 'This is a great startup idea! I love the concept.'
        }
      });

      console.log('✅ Real comment notification created successfully:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Real comment scenario simulated successfully',
        notificationId,
        scenario: {
          startupOwner: {
            id: session.user.id,
            name: session.user.name || session.user.username
          },
                   commenter: {
           id: session.user.id,
           name: session.user.name || session.user.username || 'Test User',
           image: session.user.image
         },
          startup: {
            id: mockStartupId,
            title: mockStartupTitle
          },
          comment: 'This is a great startup idea! I love the concept.'
        },
        notificationType: 'comment',
        whatHappened: 'Simulated a user commenting on your startup - you should receive a notification!'
      });

    } catch (sanityError: any) {
      console.error('❌ Sanity error creating real comment notification:', sanityError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create real comment notification in Sanity',
        details: sanityError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in test real comment:', error);
    return NextResponse.json({
      success: false,
      error: 'System error',
      details: error.message
    }, { status: 500 });
  }
} 