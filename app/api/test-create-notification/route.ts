import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification } from '@/sanity/lib/notifications';

export async function POST() {
  try {
    console.log('✅ Test create notification endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Creating test notification for user:', session.user.id);

          try {
        // Create a simple test notification without startup references
        const notificationId = await createNotification({
          recipientId: session.user.id,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification to verify the system is working!',
          actionUrl: '/test-notifications'
        });

      console.log('✅ Test notification created successfully:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Test notification created',
        notificationId,
        user: {
          id: session.user.id,
          name: session.user.name || session.user.username
        }
      });

    } catch (sanityError) {
      console.error('❌ Sanity error creating test notification:', sanityError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create notification in Sanity',
        details: sanityError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in test create notification:', error);
    return NextResponse.json({
      success: false,
      error: 'System error',
      details: error.message
    }, { status: 500 });
  }
} 