import { NextRequest, NextResponse } from 'next/server';
import { createInterestedSubmissionNotification } from '@/sanity/lib/notifications';

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
    const { 
      interestedUserId, 
      startupOwnerId, 
      startupId, 
      startupTitle, 
      interestedUserName, 
      interestedUserEmail,
      message 
    } = body;

    if (!interestedUserId || !startupOwnerId || !startupId || !startupTitle || !interestedUserName || !interestedUserEmail || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: interestedUserId, startupOwnerId, startupId, startupTitle, interestedUserName, interestedUserEmail, message' 
      }, { status: 400 });
    }

    // Create test notification using the unified system
    const notificationId = await createInterestedSubmissionNotification(
      interestedUserId,
      startupOwnerId,
      startupId,
      startupTitle,
      interestedUserName,
      interestedUserEmail,
      'test-submission-id', // test submission ID
      message,
      undefined, // no image for test
      {
        phone: '+1 (555) 123-4567',
        company: 'Test Company Inc.',
        role: 'CEO',
        investmentAmount: '$50,000 - $100,000',
        investmentType: 'Seed Round',
        timeline: '3-6 months',
        preferredContact: 'email',
        linkedin: 'https://linkedin.com/in/testuser',
        website: 'https://testcompany.com',
        experience: '5+ years in tech startups',
        howDidYouHear: 'Foundrly platform'
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Test interested submission notification created successfully',
      notificationId,
      note: 'This will trigger in-app notification, email, and push notification automatically'
    });
  } catch (error: any) {
    console.error('Error creating test interested notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create test notification' 
    }, { status: 500 });
  }
}
