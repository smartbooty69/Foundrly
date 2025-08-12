import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sendTestEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: Request) {
  try {
    console.log('✅ Test email endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Missing email address' 
      }, { status: 400 });
    }

    console.log('✅ Sending test email to:', email);

    // Check if email is configured first
    if (!isEmailConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
        details: 'Please set SMTP_USER and SMTP_PASS environment variables in your .env.local file'
      }, { status: 400 });
    }

    const result = await sendTestEmail(email);

    console.log('✅ Test email sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      user: {
        id: session.user.id,
        name: session.user.name || session.user.username
      }
    });

  } catch (error: any) {
    console.error('❌ Error in test email:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 