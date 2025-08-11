import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function PATCH() {
  try {
    console.log('Test PATCH endpoint called');
    
    // Test 1: Basic functionality
    console.log('✅ Basic PATCH method is working');
    
    // Test 2: Authentication
    try {
      const session = await getServerSession(authOptions);
      console.log('✅ Authentication check passed:', !!session?.user);
      console.log('User ID:', session?.user?.id);
      
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
    } catch (authError) {
      console.error('❌ Authentication error:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        details: authError.message
      }, { status: 500 });
    }
    
    // Test 3: Return success
    const response = {
      success: true,
      message: 'Test PATCH endpoint working',
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Returning success response:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Test PATCH endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 