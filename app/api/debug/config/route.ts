import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isClient = typeof window !== 'undefined';

  // Check server-side environment variables
  const config = {
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? '✅ 已設定 (伺服器端)' : '❌ 未設定',
    hasClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(config);
}
