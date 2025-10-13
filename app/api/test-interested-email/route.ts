import { NextRequest, NextResponse } from 'next/server';
import { sendInterestedSubmissionEmail } from '@/lib/emailNotifications';

export async function POST(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = req.headers.get('x-admin-secret') || '';
    const hostHeader = req.headers.get('host') || '';
    const isLocalhost = hostHeader.includes('localhost') || hostHeader.startsWith('127.0.0.1');

    // Security check for production
    if (!isDev && !isLocalhost) {
      if (!adminSecret || providedSecret !== adminSecret) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    const { to, startupOwnerName, startupTitle, interestedUserName } = body;

    if (!to || !startupOwnerName || !startupTitle || !interestedUserName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: to, startupOwnerName, startupTitle, interestedUserName' 
      }, { status: 400 });
    }

    // Create test data for the interested submission email
    const testEmailData = {
      startupOwnerName,
      startupOwnerEmail: to,
      startupTitle,
      interestedUserName,
      interestedUserEmail: 'test@example.com',
      interestedUserPhone: '+1 (555) 123-4567',
      interestedUserCompany: 'Test Company Inc.',
      interestedUserRole: 'CEO',
      message: 'This is a test message to verify that the interested form email notification is working correctly.',
      investmentAmount: '$50,000 - $100,000',
      investmentType: 'Seed Round',
      timeline: '3-6 months',
      preferredContact: 'email',
      linkedin: 'https://linkedin.com/in/testuser',
      website: 'https://testcompany.com',
      experience: '5+ years in tech startups',
      howDidYouHear: 'Foundrly platform',
      submittedAt: new Date().toISOString(),
    };

    const result = await sendInterestedSubmissionEmail(testEmailData);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test interested submission email sent successfully',
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to send email' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error sending test interested email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to send test email' 
    }, { status: 500 });
  }
}
