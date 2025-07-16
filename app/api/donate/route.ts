import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    if (!amount || typeof amount !== 'number' || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'upi'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Foundrly Donation',
            },
            unit_amount: Math.round(amount * 100), // Stripe expects paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate/thank-you`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: 'Stripe error', details: err instanceof Error ? err.message : err }, { status: 500 });
  }
} 