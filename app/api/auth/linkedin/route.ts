import { NextResponse } from 'next/server';
import { linkedinService } from '@/services/social';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authUrl = linkedinService.getAuthUrl();

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('Error generating LinkedIn auth URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate LinkedIn auth URL',
      },
      { status: 500 }
    );
  }
}
