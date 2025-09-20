import { NextResponse } from 'next/server';
import { ServerPushNotificationService } from '@/lib/serverPushNotifications';

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    
    console.log('🧪 Test notification received:', notification);
    
    const result = await ServerPushNotificationService.sendNotification({
      type: notification.type,
      recipientId: 'test-user-123',
      title: notification.title,
      message: notification.message,
      metadata: notification.metadata
    });

    return NextResponse.json({
      success: result,
      message: result ? 'Test notification sent successfully' : 'Failed to send test notification'
    });

  } catch (error) {
    console.error('❌ Error in test notification API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
