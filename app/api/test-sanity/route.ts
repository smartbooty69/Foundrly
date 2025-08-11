import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET() {
  try {
    console.log('Testing Sanity connection...');
    
    // Test basic Sanity connection
    const testQuery = `count(*[_type == "author"])`;
    const authorCount = await client.fetch(testQuery);
    console.log('Author count:', authorCount);
    
    // Test notification schema
    try {
      const notificationQuery = `count(*[_type == "notification"])`;
      const notificationCount = await client.fetch(notificationQuery);
      console.log('Notification count:', notificationCount);
      
      return NextResponse.json({
        success: true,
        authorCount,
        notificationCount,
        message: 'Sanity is working and notification schema is accessible'
      });
    } catch (notificationError) {
      console.error('Notification schema error:', notificationError);
      
      return NextResponse.json({
        success: false,
        authorCount,
        notificationError: notificationError.message,
        message: 'Sanity is working but notification schema has issues'
      });
    }
    
  } catch (error) {
    console.error('Sanity connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to connect to Sanity'
    }, { status: 500 });
  }
} 