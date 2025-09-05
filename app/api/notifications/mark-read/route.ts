import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/sanity/lib/write-client';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { notificationId, markAllAsRead } = await req.json();

    if (markAllAsRead) {
      // Mark all notifications as read for the current user
      const result = await writeClient
        .patch()
        .setIfMissing({})
        .match({ recipient: { _ref: session.user.id }, isRead: false })
        .set({
          isRead: true,
          readAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      // Mark specific notification as read
      const result = await writeClient
        .patch(notificationId)
        .set({
          isRead: true,
          readAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Notification ID is required'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to mark notification as read'
    }, { status: 500 });
  }
}
