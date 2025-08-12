import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { EmailNotificationService } from '@/lib/emailNotifications';

export async function POST(request: Request) {
  try {
    console.log('✅ Test email notifications endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailType, userEmail } = await request.json();
    
    if (!emailType || !userEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: emailType and userEmail' 
      }, { status: 400 });
    }

    console.log('✅ Testing email notification:', { emailType, userEmail });

    let result;
    let testData;

    switch (emailType) {
      case 'accountSuspended':
        testData = {
          reportReason: 'Multiple community guideline violations',
          actionTaken: '7-day suspension, content review required',
          duration: '7 days',
          strikeNumber: 1
        };
        result = await EmailNotificationService.sendAccountSuspendedEmail(session.user.id, testData);
        break;

      case 'warningIssued':
        testData = {
          contentType: 'Comment',
          reportReason: 'Inappropriate language',
          strikeNumber: 1
        };
        result = await EmailNotificationService.sendWarningEmail(session.user.id, testData);
        break;

      case 'permanentBan':
        testData = {
          reportReason: 'Repeated violations - 3rd strike',
          actionTaken: 'Account permanently banned'
        };
        result = await EmailNotificationService.sendPermanentBanEmail(session.user.id, testData);
        break;

      case 'reportSubmitted':
        testData = {
          contentType: 'Comment',
          reportReason: 'Hate speech',
          timestamp: new Date().toLocaleString()
        };
        result = await EmailNotificationService.sendReportSubmittedEmail(session.user.id, testData);
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid email type. Valid types: accountSuspended, warningIssued, permanentBan, reportSubmitted' 
        }, { status: 400 });
    }

    console.log('✅ Test email sent successfully');

    return NextResponse.json({
      success: true,
      message: `Test ${emailType} email sent successfully`,
      emailType,
      testData,
      user: {
        id: session.user.id,
        name: session.user.name || session.user.username
      }
    });

  } catch (error: any) {
    console.error('❌ Error in test email notifications:', {
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