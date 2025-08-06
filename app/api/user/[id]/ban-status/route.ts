import { NextResponse } from 'next/server'
import { checkUserBanStatus, getBanStatusMessage } from '@/lib/ban-checks'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const banResult = await checkUserBanStatus(userId)
    const message = getBanStatusMessage(banResult)

    return NextResponse.json({
      ...banResult,
      message
    })
  } catch (error) {
    console.error('Error checking ban status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 