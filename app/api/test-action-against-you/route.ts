import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification } from '@/sanity/lib/notifications';

export async function POST() {
  try {
    console.log('✅ Test action against you notification endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Creating test action against you notification for user:', session.user.id);

    try {
      // Create different types of "action taken against you" notifications
      const actionTypes = [
        {
          title: 'Content Removed',
          message: 'Your comment has been removed due to community guidelines violation',
          actionTaken: 'Comment deleted, warning issued',
          reportReason: 'Inappropriate language',
          severity: 'Warning'
        },
        {
          title: 'Account Suspended',
          message: 'Your account has been temporarily suspended for repeated violations',
          actionTaken: '7-day suspension, content review required',
          reportReason: 'Multiple community guideline violations',
          severity: 'Suspension'
        },
        {
          title: 'Profile Restricted',
          message: 'Your profile has been restricted from posting new content',
          actionTaken: 'Posting privileges suspended, review in progress',
          reportReason: 'Spam behavior detected',
          severity: 'Restriction'
        },
        {
          title: 'Comment Moderation',
          message: 'Your comment has been flagged and is under review',
          actionTaken: 'Comment hidden pending review',
          reportReason: 'Potential misinformation',
          severity: 'Under Review'
        }
      ];

      const randomAction = actionTypes[Math.floor(Math.random() * actionTypes.length)];

      console.log('🔔 Creating action against you notification:', randomAction);
      console.log('🔔 Using recipientId:', session.user.id);
      console.log('🔔 Using senderId:', session.user.id);

      const notificationData = {
        recipientId: session.user.id,
        type: 'report',
        title: randomAction.title,
        message: randomAction.message,
        senderId: session.user.id, // Use current user as sender for testing
        actionUrl: '/notifications',
        metadata: {
          reportReason: randomAction.reportReason,
          reportStatus: randomAction.severity,
          actionTaken: randomAction.actionTaken
        }
      };

      console.log('🔔 Full notification data:', notificationData);

      const notificationId = await createNotification(notificationData);

      console.log('✅ Test action against you notification created successfully:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Test action against you notification created',
        notificationId,
        user: {
          id: session.user.id,
          name: session.user.name || session.user.username
        },
        notificationType: 'report',
        actionDetails: randomAction,
        metadata: {
          reportReason: randomAction.reportReason,
          reportStatus: randomAction.severity,
          actionTaken: randomAction.actionTaken
        }
      });

    } catch (sanityError: any) {
      console.error('❌ Sanity error creating test action against you notification:', {
        error: sanityError,
        message: sanityError.message,
        stack: sanityError.stack,
        name: sanityError.name
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create action against you notification in Sanity',
        details: sanityError.message || 'Unknown Sanity error'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in test action against you notification:', {
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