import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    console.log('✅ Simple test email endpoint called');
    
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

    console.log('✅ Would send email to:', email);

    return NextResponse.json({
      success: true,
      message: 'Test endpoint working - email would be sent here',
      email,
      user: {
        id: session.user.id,
        name: session.user.name || session.user.username
      }
    });

  } catch (error: any) {
    console.error('❌ Error in simple test email:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 