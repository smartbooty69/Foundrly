import { NextRequest, NextResponse } from 'next/server';
import { testEmailConfiguration } from '@/lib/emailNotifications';

export async function GET(req: NextRequest) {
  try {
    const result = await testEmailConfiguration();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return NextResponse.json({
      success: false,
      message: `Error testing email configuration: ${error.message}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

