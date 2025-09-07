import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { aiService } from '@/lib/ai-services';
import { canUserPerformAction } from '@/lib/ban-checks';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized - Please log in to moderate content' 
      }, { status: 401 });
    }

    // Check if user is banned
    const banCheck = await canUserPerformAction(session.user.id);
    if (!banCheck.canPerform) {
      return NextResponse.json({ 
        success: false, 
        message: banCheck.message 
      }, { status: 403 });
    }

    const { content, contentType } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Content is required' 
      }, { status: 400 });
    }

    // Moderate content using AI
    const moderation = await aiService.moderateContent(content.trim(), contentType || 'startup');

    return NextResponse.json({
      success: true,
      moderation
    });

  } catch (error) {
    console.error('Error in content moderation API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to moderate content' 
    }, { status: 500 });
  }
}

