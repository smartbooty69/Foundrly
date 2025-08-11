import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Debug endpoint called successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 