import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    console.log('✅ Minimal test email endpoint called');
    
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

    // Check environment variables
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const isConfigured = !!(smtpUser && smtpPass);

    console.log('✅ Environment check:', { 
      smtpUser: smtpUser ? 'Set' : 'Not set', 
      smtpPass: smtpPass ? 'Set' : 'Not set',
      isConfigured 
    });

    return NextResponse.json({
      success: true,
      message: 'Minimal test endpoint working',
      email,
      emailConfigured: isConfigured,
      user: {
        id: session.user.id,
        name: session.user.name || session.user.username
      }
    });

  } catch (error: any) {
    console.error('❌ Error in minimal test email:', {
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