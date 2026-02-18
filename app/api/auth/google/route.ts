import { NextResponse } from 'next/server';
import { googleService } from '@/services/social';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authUrl = googleService.getAuthUrl();

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate Google auth URL',
      },
      { status: 500 }
    );
  }
}
