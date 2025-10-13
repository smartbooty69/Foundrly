import { NextRequest, NextResponse } from 'next/server';
import { isEmailConfigured, sendTestEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = req.headers.get('x-admin-secret') || '';
    const hostHeader = req.headers.get('host') || '';
    const isLocalhost = hostHeader.includes('localhost') || hostHeader.startsWith('127.0.0.1');

    if (!isDev && !isLocalhost) {
      if (!adminSecret || providedSecret !== adminSecret) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!isEmailConfigured()) {
      return NextResponse.json({ success: false, error: 'Email not configured' }, { status: 500 });
    }

    const body = await req.json();
    const to: string = body?.to;

    if (!to) {
      return NextResponse.json({ success: false, error: 'Missing "to"' }, { status: 400 });
    }

    const result = await sendTestEmail(to);
    return NextResponse.json({ success: true, messageId: result.messageId || 'ok' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to send email' }, { status: 500 });
  }
}


