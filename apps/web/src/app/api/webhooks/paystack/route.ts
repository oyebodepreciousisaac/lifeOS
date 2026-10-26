import { NextRequest, NextResponse } from 'next/server';
import { processPaystackWebhook } from '../../../../lib/finance/finance-store';

export const dynamic = 'force-dynamic';

/**
 * Paystack Webhook Handler
 * Verified with HMAC-SHA512 cryptographic signature
 * Grounded in Playbook Risk R4 (Payment Double-Crediting or Webhook Spoofing)
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing x-paystack-signature header' },
        { status: 401 }
      );
    }

    const rawBody = await req.text();

    const result = await processPaystackWebhook(rawBody, signature);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: 'success', message: result.message, data: result.data },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal webhook processing failure' },
      { status: 500 }
    );
  }
}
